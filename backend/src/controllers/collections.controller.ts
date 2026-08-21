import { Request, Response } from 'express';
import { getItemsById, getItemsByIds } from './tools';

interface CollectionBase {
	id: number;
	name: string;
	type: "places" | "cities";
	updateddate: string; // 'YYYY-MM-DD'
	cards_count: number;
}

interface CollectionFullResponse extends CollectionBase {
	description: string | null;
	tags: { id: number; name: string; slug: string }[] | null;
}

interface CollectionShortResponse extends CollectionBase {
	photo: string[] | null;
	tag: { id: number; name: string; slug: string } | null;
}

export async function getCollectionFull(req: Request, res: Response) {
	const path = '/collections/full/:id';
	const query = `
			SELECT 
					c.id,
					c.name,
					c.type,
					c.description,
					c.updateddate::text AS updateddate,
					COALESCE(tags.items, '[]'::json) AS tags,
					COALESCE(items.list, '[]'::json) AS items
			FROM collections c
			LEFT JOIN LATERAL (
					SELECT json_agg(
							json_build_object('id', t.id, 'name', t.name, 'slug', t.slug) 
							ORDER BY pt.position
					) AS items
					FROM collection_tags pt
					JOIN tags t ON t.id = pt.tag_id
					WHERE pt.collection_id = c.id
			) tags ON true
			LEFT JOIN LATERAL (
					SELECT json_agg(entity ORDER BY entity_position) AS list
					FROM (
							-- places
							SELECT
									cp.position AS entity_position,
									json_build_object(
											'id', p.id,
											'photo', ph.url,
											'name', p.name,
											'rate', p.rate::float,
											'description', p.description,
											'loc', CASE 
													WHEN p.loc IS NOT NULL AND p.loc != '' THEN CONCAT(city.name, ', ', p.loc)
													ELSE city.name
											END
									) AS entity
							FROM collection_places cp
							JOIN places p ON p.id = cp.place_id
							LEFT JOIN cities city ON city.id = p.city_id
							LEFT JOIN LATERAL (
									SELECT pp.url 
									FROM place_photos pp 
									WHERE pp.place_id = p.id AND pp.position = 1 
									LIMIT 1
							) ph ON true
							WHERE cp.collection_id = c.id
								AND p.visibility = true

							UNION ALL

							-- cities
							SELECT
									cc.position AS entity_position,
									json_build_object(
											'id', ci.id,
											'photo', ph2.url,
											'name', ci.name,
											'description', ci.description,
											'loc', country.name
									) AS entity
							FROM collection_cities cc
							JOIN cities ci ON ci.id = cc.city_id
							LEFT JOIN countries country ON country.id = ci.country_id
							LEFT JOIN LATERAL (
									SELECT cph.url 
									FROM city_photos cph 
									WHERE cph.city_id = ci.id AND cph.position = 1 
									LIMIT 1
							) ph2 ON true
							WHERE cc.collection_id = c.id
								AND ci.visibility = true
					) combined
			) items ON true
			WHERE c.id = $1
					AND c.visibility = true;
		`;
	getItemsById<CollectionFullResponse>(req, res, path, query);
}

const baseQuery = `
		SELECT 
					c.id,
					c.name,
					c.updateddate::text AS updateddate,
					c.type,
					COALESCE(photo.urls, '[]'::json) AS photos,
					CASE 
							WHEN tag.id IS NULL THEN NULL 
							ELSE json_build_object('id', tag.id, 'name', tag.name, 'slug', tag.slug, 'text_color', tag.text_color, 'bg_color', tag.bg_color) 
					END AS tag,
					COALESCE(cnt.cards_count, 0) AS cards_count
			FROM collections c
			LEFT JOIN LATERAL (
					SELECT json_agg(found.photo_url ORDER BY found.entity_position) AS urls
					FROM (
							SELECT combined.entity_position, ph.url AS photo_url
							FROM (
									SELECT cp.position AS entity_position, cp.place_id AS entity_id, 'place' AS entity_type
									FROM collection_places cp
									WHERE cp.collection_id = c.id

									UNION ALL

									SELECT cc.position, cc.city_id, 'city'
									FROM collection_cities cc
									WHERE cc.collection_id = c.id
							) combined
							JOIN LATERAL (
									SELECT pp.url
									FROM place_photos pp
									WHERE pp.place_id = combined.entity_id AND pp.position = 1 AND combined.entity_type = 'place'
									UNION ALL
									SELECT cph.url
									FROM city_photos cph
									WHERE cph.city_id = combined.entity_id AND cph.position = 1 AND combined.entity_type = 'city'
									LIMIT 1
							) ph ON true
							ORDER BY combined.entity_position
							LIMIT 2
					) found
			) photo ON true
			LEFT JOIN LATERAL (
					SELECT t.id, t.name, t.slug, t.text_color, t.bg_color
					FROM collection_tags pt
					JOIN tags t ON t.id = pt.tag_id
					WHERE pt.collection_id = c.id AND pt.position = 1
					LIMIT 1
			) tag ON true
			LEFT JOIN LATERAL (
					SELECT COUNT(*)::int as cards_count
					FROM (
							SELECT cp.place_id AS entity_id
							FROM collection_places cp
							WHERE cp.collection_id = c.id

							UNION ALL

							SELECT cc.city_id
							FROM collection_cities cc
							WHERE cc.collection_id = c.id
					) all_cards
			) cnt ON true
			WHERE
	`;

export async function getCollectionShort(req: Request, res: Response) {
	const path = '/collections/short/:ids';
	const query = baseQuery + 'c.id = ANY($1) AND c.visibility = true;';
	getItemsByIds<CollectionShortResponse>(req, res, path, query);
};

export async function getCollectionRelated(req: Request, res: Response) {
	const path = '/collections/related/:id';
	const query = baseQuery + 'c.id != $1 AND c.visibility = true ORDER BY random() LIMIT 2';
	getItemsById<CollectionShortResponse>(req, res, path, query);
}