import { Request, Response } from 'express';
import { pool } from '../db';

class ValidationError extends Error { }

interface SearchResultShort {
	type: 'place' | 'city' | 'country' | 'collection' | 'tag';
	id: number;
	name: string;
	slug: string | null;
}

interface SearchResultFull {
	type: 'place' | 'city' | 'country' | 'collection' | 'tag';
	id: number;
	name: string;
	slug: string | null;
	loc: string | null;
	photos: string[];
	total_count?: number;
}

export async function getSearchShort(req: Request, res: Response) {
	console.log('/search/short?q=:q');

	const query = `
	SELECT 'place' AS type, id, name, NULL AS slug
	FROM places
	WHERE visibility = true AND name ILIKE '%' || $1 || '%'

	UNION ALL

	SELECT 'city' AS type, id, name, NULL AS slug
	FROM cities
	WHERE visibility = true AND name ILIKE '%' || $1 || '%'

	UNION ALL

	SELECT 'country' AS type, id, name, NULL AS slug
	FROM countries
	WHERE visibility = true AND name ILIKE '%' || $1 || '%'

	UNION ALL

	SELECT 'collection' AS type, id, name, NULL AS slug
	FROM collections
	WHERE visibility = true AND name ILIKE '%' || $1 || '%'

	UNION ALL

	SELECT 'tag' AS type, id, name, slug
	FROM tags
	WHERE name ILIKE '%' || $1 || '%'

	ORDER BY name
	LIMIT 10;
	`;

	try {
		const q = req.query.q as string | undefined;

		if (!q || q.trim() === '') {
			throw new ValidationError('Query parameter "q" is required');
		}

		const result = await pool.query<SearchResultShort>(query, [q]);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: 'No results found' });
		}

		res.json(result.rows);
	} catch (error) {
		if (error instanceof ValidationError) {
			return res.status(400).json({ error: error.message });
		}
		console.error('Error fetching search results:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
}

export async function getSearchFull(req: Request, res: Response) {
	console.log('/search/full?q=&page=&limit=&types=&tags=');

	const query = `
	WITH combined AS (
		SELECT 
			'place' AS type, p.id, p.name, NULL::text AS slug,
			CASE 
				WHEN p.loc IS NOT NULL AND p.loc != '' THEN CONCAT(city.name, ', ', p.loc)
				ELSE city.name
			END AS loc,
			to_jsonb(array_remove(ARRAY[ph.url], NULL)) AS photos,
			CASE 
				WHEN ptag.id IS NULL THEN NULL 
				ELSE jsonb_build_object('id', ptag.id, 'name', ptag.name, 'slug', ptag.slug, 'text_color', ptag.text_color, 'bg_color', ptag.bg_color) 
			END AS tag,
			p.updateddate::text AS updateddate,
			NULL::collection_type AS collection_type,
			NULL::int AS cards_count
		FROM places p
		LEFT JOIN cities city ON city.id = p.city_id
		LEFT JOIN LATERAL (
			SELECT url FROM place_photos WHERE place_id = p.id AND position = 1 LIMIT 1
		) ph ON true
		LEFT JOIN LATERAL (
			SELECT t.id, t.name, t.slug, t.text_color, t.bg_color
			FROM place_tags pt
			JOIN tags t ON t.id = pt.tag_id
			WHERE pt.place_id = p.id AND pt.position = 1
			LIMIT 1
		) ptag ON true
		WHERE p.visibility = true
			AND ($1::text IS NULL OR p.name ILIKE '%' || $1 || '%')
			AND (
				$2::text[] IS NULL
				OR EXISTS (
					SELECT 1 FROM place_tags pt2 JOIN tags t2 ON t2.id = pt2.tag_id
					WHERE pt2.place_id = p.id AND t2.slug = ANY($2)
				)
			)

		UNION ALL

		SELECT 
			'city' AS type, ci.id, ci.name, NULL::text AS slug,
			country.name AS loc,
			to_jsonb(array_remove(ARRAY[ph2.url], NULL)) AS photos,
			CASE 
				WHEN ctag.id IS NULL THEN NULL 
				ELSE jsonb_build_object('id', ctag.id, 'name', ctag.name, 'slug', ctag.slug, 'text_color', ctag.text_color, 'bg_color', ctag.bg_color) 
			END AS tag,
			ci.updateddate::text AS updateddate,
			NULL::collection_type AS collection_type,
			NULL::int AS cards_count
		FROM cities ci
		LEFT JOIN countries country ON country.id = ci.country_id
		LEFT JOIN LATERAL (
			SELECT url FROM city_photos WHERE city_id = ci.id AND position = 1 LIMIT 1
		) ph2 ON true
		LEFT JOIN LATERAL (
			SELECT t.id, t.name, t.slug, t.text_color, t.bg_color
			FROM city_tags ct
			JOIN tags t ON t.id = ct.tag_id
			WHERE ct.city_id = ci.id AND ct.position = 1
			LIMIT 1
		) ctag ON true
		WHERE ci.visibility = true
			AND ($1::text IS NULL OR ci.name ILIKE '%' || $1 || '%')
			AND (
				$2::text[] IS NULL
				OR EXISTS (
					SELECT 1 FROM city_tags ct2 JOIN tags t2 ON t2.id = ct2.tag_id
					WHERE ct2.city_id = ci.id AND t2.slug = ANY($2)
				)
			)

		UNION ALL

		SELECT 
			'country' AS type, co.id, co.name, NULL::text AS slug,
			NULL AS loc, '[]'::jsonb AS photos,
			NULL::jsonb AS tag,
			co.updateddate::text AS updateddate,
			NULL::collection_type AS collection_type,
			NULL::int AS cards_count
		FROM countries co
		WHERE co.visibility = true
			AND ($1::text IS NULL OR co.name ILIKE '%' || $1 || '%')
			AND $2::text[] IS NULL

		UNION ALL

		SELECT 
			'collection' AS type, col.id, col.name, NULL::text AS slug,
			NULL AS loc,
			COALESCE(col_photos.urls, '[]'::jsonb) AS photos,
			CASE 
				WHEN coltag.id IS NULL THEN NULL 
				ELSE jsonb_build_object('id', coltag.id, 'name', coltag.name, 'slug', coltag.slug, 'text_color', coltag.text_color, 'bg_color', coltag.bg_color) 
			END AS tag,
			col.updateddate::text AS updateddate,
			col.type AS collection_type,
			COALESCE(cnt.cards_count, 0) AS cards_count
		FROM collections col
		LEFT JOIN LATERAL (
			SELECT json_agg(found.photo_url ORDER BY found.entity_position)::jsonb AS urls
			FROM (
				SELECT combined_cards.entity_position, pcard.url AS photo_url
				FROM (
					SELECT cp.position AS entity_position, cp.place_id AS entity_id, 'place' AS entity_type
					FROM collection_places cp WHERE cp.collection_id = col.id
					UNION ALL
					SELECT cc.position, cc.city_id, 'city'
					FROM collection_cities cc WHERE cc.collection_id = col.id
				) combined_cards
				JOIN LATERAL (
					SELECT pp.url FROM place_photos pp 
					WHERE pp.place_id = combined_cards.entity_id AND pp.position = 1 AND combined_cards.entity_type = 'place'
					UNION ALL
					SELECT cph.url FROM city_photos cph 
					WHERE cph.city_id = combined_cards.entity_id AND cph.position = 1 AND combined_cards.entity_type = 'city'
					LIMIT 1
				) pcard ON true
				ORDER BY combined_cards.entity_position
				LIMIT 2
			) found
		) col_photos ON true
		LEFT JOIN LATERAL (
			SELECT t.id, t.name, t.slug, t.text_color, t.bg_color
			FROM collection_tags cot
			JOIN tags t ON t.id = cot.tag_id
			WHERE cot.collection_id = col.id AND cot.position = 1
			LIMIT 1
		) coltag ON true
		LEFT JOIN LATERAL (                                        -- добавили
			SELECT COUNT(*)::int AS cards_count
			FROM (
				SELECT cp.place_id AS entity_id
				FROM collection_places cp WHERE cp.collection_id = col.id
				UNION ALL
				SELECT cc.city_id
				FROM collection_cities cc WHERE cc.collection_id = col.id
				UNION ALL
				SELECT ccnt.country_id
				FROM collection_countries ccnt WHERE ccnt.collection_id = col.id
			) all_cards
		) cnt ON true
		WHERE col.visibility = true
			AND ($1::text IS NULL OR col.name ILIKE '%' || $1 || '%')
			AND (
				$2::text[] IS NULL
				OR EXISTS (
					SELECT 1 FROM collection_tags cot2 JOIN tags t2 ON t2.id = cot2.tag_id
					WHERE cot2.collection_id = col.id AND t2.slug = ANY($2)
				)
			)

		UNION ALL

		SELECT
			'article' AS type, a.id, a.name, NULL::text AS slug,
			NULL AS loc,
			to_jsonb(array_remove(ARRAY[photo.url], NULL)) AS photos,
			CASE 
				WHEN atag.id IS NULL THEN NULL 
				ELSE jsonb_build_object('id', atag.id, 'name', atag.name, 'slug', atag.slug, 'text_color', atag.text_color, 'bg_color', atag.bg_color) 
			END AS tag,
			a.updateddate::text AS updateddate,
			NULL::collection_type AS collection_type,
			NULL::int AS cards_count
		FROM articles a
		LEFT JOIN LATERAL (
			SELECT ap.url
			FROM article_photos ap
			WHERE ap.article_id = a.id AND ap.position = 1
			LIMIT 1
		) photo ON true
		LEFT JOIN LATERAL (
			SELECT t.id, t.name, t.slug, t.text_color, t.bg_color
			FROM article_tags at
			JOIN tags t ON t.id = at.tag_id
			WHERE at.article_id = a.id AND at.position = 1
			LIMIT 1
		) atag ON true
		WHERE a.visibility = true
			AND ($1::text IS NULL OR a.name ILIKE '%' || $1 || '%')
			AND (
				$2::text[] IS NULL
				OR EXISTS (
					SELECT 1 FROM article_tags at2 JOIN tags t2 ON t2.id = at2.tag_id
					WHERE at2.article_id = a.id AND t2.slug = ANY($2)
				)
			)

		UNION ALL

		SELECT 
			'tag' AS type, t.id, t.name, t.slug, NULL AS loc, '[]'::jsonb AS photos,
			NULL::jsonb AS tag,
			NULL::text AS updateddate,
			NULL::collection_type AS collection_type,
			NULL::int AS cards_count
		FROM tags t
		WHERE ($1::text IS NULL OR t.name ILIKE '%' || $1 || '%')
			AND $2::text[] IS NULL
	)
	SELECT *, COUNT(*) OVER()::int AS total_count
	FROM combined
	WHERE ($3::text[] IS NULL OR type = ANY($3))
	ORDER BY name
	LIMIT $4 OFFSET $5;
	`;

	try {
		const q = (req.query.q as string)?.trim() || null;
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 10;

		const toArray = (v: unknown): string[] | null =>
			v == null ? null : Array.isArray(v) ? (v as string[]) : (v as string).split(',');

		const tags = toArray(req.query.tags);
		const types = toArray(req.query.types);

		if (page < 1 || limit < 1) {
			throw new ValidationError('Parameters "page" and "limit" must be positive');
		}

		const offset = (page - 1) * limit;
		const result = await pool.query<SearchResultFull>(query, [q, tags, types, limit, offset]);

		const total = result.rows[0]?.total_count || 0;
		const data = result.rows.map(({ total_count, ...rest }) => rest);

		res.json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });
	} catch (error) {
		if (error instanceof ValidationError) {
			return res.status(400).json({ error: error.message });
		}
		console.error('Error fetching full search results:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
}