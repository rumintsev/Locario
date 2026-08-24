import { Request, Response } from 'express';
import { getItemsById, getItemsByIds } from './tools';

interface PlaceBase {
	id: number;
	name: string;
	rate: number | null;
	updateddate: string; // 'YYYY-MM-DD'
}

interface PlaceFullResponse extends PlaceBase {
	description: string | null;
	article: string | null;
	loc: string | null;
	photo: string[];
	tags: {
		id: number;
		name: string;
		slug: string;
		text_color: string;
		bg_color: string;
	}[] | null;
}

interface PlaceShortResponse extends PlaceBase {
	photo: string | null;
	tag: {
		id: number;
		name: string;
		slug: string;
		text_color: string;
		bg_color: string;
	} | null;
}

export async function getPlaceFull(req: Request, res: Response) {
	const path = '/places/full/:id';
	const query = `
      SELECT 
					p.id,
					p.name,
					p.rate::float AS rate,
					p.description,
					p.article,
					p.updateddate::text AS updateddate,
					CASE 
							WHEN p.loc IS NOT NULL AND p.loc != '' THEN CONCAT(c.name, ', ', p.loc)
							ELSE c.name
					END as loc,
					COALESCE(photos.urls, ARRAY[]::text[]) AS photo,
					COALESCE(tags.items, '[]'::json) AS tags
			FROM places p
			LEFT JOIN cities c ON c.id = p.city_id
			LEFT JOIN LATERAL (
					SELECT array_agg(pp.url ORDER BY pp.position, pp.id) AS urls
					FROM place_photos pp
					WHERE pp.place_id = p.id
			) photos ON true
			LEFT JOIN LATERAL (
					SELECT json_agg(json_build_object('id', t.id, 'name', t.name, 'slug', t.slug, 'text_color', t.text_color, 'bg_color', t.bg_color) ORDER BY pt.position) AS items
					FROM place_tags pt
					JOIN tags t ON t.id = pt.tag_id
					WHERE pt.place_id = p.id
			) tags ON true
			WHERE p.id = $1
					AND p.visibility = true;
    `;
	getItemsById<PlaceFullResponse>(req, res, path, query);
}

const baseQuery = `
		SELECT 
			p.id,
			p.name,
			p.rate::float AS rate,
			p.updateddate::text AS updateddate,
			photo.url AS photo,
			CASE 
				WHEN tag.id IS NULL THEN NULL 
				ELSE json_build_object('id', tag.id, 'name', tag.name, 'slug', tag.slug, 'text_color', tag.text_color, 'bg_color', tag.bg_color) 
			END AS tag
		FROM places p
		LEFT JOIN LATERAL (
			SELECT pp.url
			FROM place_photos pp
			WHERE pp.place_id = p.id AND pp.position = 1
			LIMIT 1
		) photo ON true
		LEFT JOIN LATERAL (
			SELECT t.id, t.name, t.slug, t.text_color, t.bg_color
			FROM place_tags pt
			JOIN tags t ON t.id = pt.tag_id
			WHERE pt.place_id = p.id AND pt.position = 1
			LIMIT 1
		) tag ON true
		WHERE
	`;

export async function getPlaceShort(req: Request, res: Response) {
	const path = '/places/short/:ids';
	const query = baseQuery + 'p.id = ANY($1)';
	getItemsByIds<PlaceShortResponse>(req, res, path, query);
};

export async function getPlaceRelated(req: Request, res: Response) {
	const path = '/places/related/:id';
	const query = baseQuery + 'p.id != $1 ORDER BY random() LIMIT 2';
	getItemsById<PlaceShortResponse>(req, res, path, query);
}