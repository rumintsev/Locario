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

function buildCombinedCTE(nameFilter: string) {
	return `
	WITH combined AS (
		SELECT 
			'place' AS type, p.id, p.name, NULL::text AS slug,
			CASE 
				WHEN p.loc IS NOT NULL AND p.loc != '' THEN CONCAT(city.name, ', ', p.loc)
				ELSE city.name
			END AS loc,
			to_jsonb(array_remove(ARRAY[ph.url], NULL)) AS photos
		FROM places p
		LEFT JOIN cities city ON city.id = p.city_id
		LEFT JOIN LATERAL (
			SELECT url FROM place_photos WHERE place_id = p.id AND position = 1 LIMIT 1
		) ph ON true
		WHERE p.visibility = true ${nameFilter}

		UNION ALL

		SELECT 
			'city' AS type, ci.id, ci.name, NULL::text AS slug,
			country.name AS loc,
			to_jsonb(array_remove(ARRAY[ph2.url], NULL)) AS photos
		FROM cities ci
		LEFT JOIN countries country ON country.id = ci.country_id
		LEFT JOIN LATERAL (
			SELECT url FROM city_photos WHERE city_id = ci.id AND position = 1 LIMIT 1
		) ph2 ON true
		WHERE ci.visibility = true ${nameFilter}

		UNION ALL

		SELECT 
			'country' AS type, co.id, co.name, NULL::text AS slug,
			NULL AS loc, '[]'::jsonb AS photos
		FROM countries co
		WHERE co.visibility = true ${nameFilter}

		UNION ALL

		SELECT 
			'collection' AS type, col.id, col.name, NULL::text AS slug,
			NULL AS loc,
			COALESCE(col_photos.urls, '[]'::jsonb) AS photos
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
		WHERE col.visibility = true ${nameFilter}
	)
	`;
}

export async function getSearchFull(req: Request, res: Response) {
	console.log('/search/full?q=:q&page=1&limit=10');
	
	const nameFilter = `AND name ILIKE '%' || $1 || '%'`;
	const query = `
	${buildCombinedCTE(nameFilter)}
	, all_types AS (
		SELECT * FROM combined
		UNION ALL
		SELECT 'tag' AS type, t.id, t.name, t.slug, NULL AS loc, '[]'::jsonb AS photos
		FROM tags t
		WHERE t.name ILIKE '%' || $1 || '%'
	)
	SELECT *, COUNT(*) OVER() AS total_count
	FROM all_types
	ORDER BY name
	LIMIT $2 OFFSET $3;
	`;

	try {
		const q = req.query.q as string | undefined;
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 10;

		if (!q || q.trim() === '') {
			throw new ValidationError('Query parameter "q" is required');
		}
		if (page < 1 || limit < 1) {
			throw new ValidationError('Parameters "page" and "limit" must be positive');
		}

		const offset = (page - 1) * limit;
		const result = await pool.query<SearchResultFull>(query, [q, limit, offset]);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: 'No results found' });
		}

		const total = result.rows[0].total_count!;
		const data = result.rows.map(({ total_count, ...rest }) => rest);

		res.json({
			data,
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		});
	} catch (error) {
		if (error instanceof ValidationError) {
			return res.status(400).json({ error: error.message });
		}
		console.error('Error fetching full search results:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
}

export async function getSearchByTag(req: Request, res: Response) {
	console.log('/search/tag/:slug');

	const nameFilterNone = '';
	const query = `
	WITH found_tag AS (
		SELECT id FROM tags WHERE slug = $1
	),
	combined AS (
		SELECT 
			'place' AS type, p.id, p.name, NULL::text AS slug,
			CASE 
				WHEN p.loc IS NOT NULL AND p.loc != '' THEN CONCAT(city.name, ', ', p.loc)
				ELSE city.name
			END AS loc,
			to_jsonb(array_remove(ARRAY[ph.url], NULL)) AS photos
		FROM place_tags pt
		JOIN places p ON p.id = pt.place_id
		LEFT JOIN cities city ON city.id = p.city_id
		LEFT JOIN LATERAL (
			SELECT url FROM place_photos WHERE place_id = p.id AND position = 1 LIMIT 1
		) ph ON true
		WHERE pt.tag_id = (SELECT id FROM found_tag) AND p.visibility = true

		UNION ALL

		SELECT 
			'city' AS type, ci.id, ci.name, NULL::text AS slug,
			country.name AS loc,
			to_jsonb(array_remove(ARRAY[ph2.url], NULL)) AS photos
		FROM city_tags ct
		JOIN cities ci ON ci.id = ct.city_id
		LEFT JOIN countries country ON country.id = ci.country_id
		LEFT JOIN LATERAL (
			SELECT url FROM city_photos WHERE city_id = ci.id AND position = 1 LIMIT 1
		) ph2 ON true
		WHERE ct.tag_id = (SELECT id FROM found_tag) AND ci.visibility = true

		UNION ALL

		SELECT 
			'collection' AS type, col.id, col.name, NULL::text AS slug,
			NULL AS loc,
			COALESCE(col_photos.urls, '[]'::jsonb) AS photos
		FROM collection_tags cot
		JOIN collections col ON col.id = cot.collection_id
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
		WHERE cot.tag_id = (SELECT id FROM found_tag) AND col.visibility = true
	)
	SELECT * FROM combined
	ORDER BY name
	LIMIT 50;
	`;

	try {
		const slug = req.params.slug as string;

		if (!slug || slug.trim() === '') {
			throw new ValidationError('Parameter "slug" is required');
		}

		const result = await pool.query<SearchResultFull>(query, [slug]);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: 'No results found' });
		}

		res.json(result.rows);
	} catch (error) {
		if (error instanceof ValidationError) {
			return res.status(400).json({ error: error.message });
		}
		console.error('Error fetching search by tag:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
}