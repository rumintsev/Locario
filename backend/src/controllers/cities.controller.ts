import { Request, Response } from 'express';
import { getItemsById, getItemsByIds } from './tools';

interface CityBase {
	id: number;
	name: string;
	updateddate: string; // 'YYYY-MM-DD'
}

interface CityFullResponse extends CityBase {
	description: string | null;
	article: string | null;
	country: string;
	photo: string[];
	tags: { id: number; name: string; slug: string }[] | null;
}

interface CityShortResponse extends CityBase {
	photo: string | null;
	tag: { id: number; name: string; slug: string } | null;
}

export async function getCityFull(req: Request, res: Response) {
	const path = '/cities/full/:id';
	const query = `
			SELECT 
					c.id,
					c.name,
					c.description,
					c.article,
					c.updateddate::text AS updateddate,
					co.name AS loc,
					COALESCE(photos.urls, ARRAY[]::text[]) AS photo,
					COALESCE(tags.items, '[]'::json) AS tags
			FROM cities c
			JOIN countries co ON co.id = c.country_id
			LEFT JOIN LATERAL (
					SELECT array_agg(cp.url ORDER BY cp.position, cp.id) AS urls
					FROM city_photos cp
					WHERE cp.city_id = c.id
			) photos ON true
			LEFT JOIN LATERAL (
					SELECT json_agg(json_build_object('id', t.id, 'name', t.name, 'slug', t.slug, 'text_color', t.text_color, 'bg_color', t.bg_color) ORDER BY pt.position) AS items
					FROM city_tags pt
					JOIN tags t ON t.id = pt.tag_id
					WHERE pt.city_id = c.id
			) tags ON true
			WHERE c.id = $1
					AND c.visibility = true;
		`;
	getItemsById<CityFullResponse>(req, res, path, query);
}

const baseQuery = `
		SELECT 
			c.id,
			c.name,
			c.updateddate::text AS updateddate,
			photo.url AS photo,
			CASE 
				WHEN tag.id IS NULL THEN NULL 
				ELSE json_build_object('id', tag.id, 'name', tag.name, 'slug', tag.slug, 'text_color', tag.text_color, 'bg_color', tag.bg_color) 
			END AS tag
		FROM cities c
		LEFT JOIN LATERAL (
			SELECT cp.url
			FROM city_photos cp
			WHERE cp.city_id = c.id AND cp.position = 1
			LIMIT 1
		) photo ON true
		LEFT JOIN LATERAL (
			SELECT t.id, t.name, t.slug, t.text_color, t.bg_color
			FROM city_tags pt
			JOIN tags t ON t.id = pt.tag_id
			WHERE pt.city_id = c.id AND pt.position = 1
			LIMIT 1
		) tag ON true
		WHERE
	`;

export async function getCityShort(req: Request, res: Response) {
	const path = '/cities/short/:ids';
	const query = baseQuery + 'c.id = ANY($1) AND c.visibility = true;';
	getItemsByIds<CityShortResponse>(req, res, path, query);
};

export async function getRelatedCities(req: Request, res: Response) {
	const path = '/cities/related/:id';
	const query = baseQuery + 'c.id != $1 AND c.visibility = true ORDER BY random() LIMIT 2';
	getItemsById<CityShortResponse>(req, res, path, query);
}