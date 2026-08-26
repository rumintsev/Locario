import { Request, Response } from 'express';
import { getItemsById, getItemsByIds } from './tools';

interface ArticleBase {
	id: number;
	name: string;
	updateddate: string; // 'YYYY-MM-DD'
	photo: string | null;
}

interface ArticleFullResponse extends ArticleBase {
	description: string | null;
	text: string | null;
	tags: { id: number; name: string; slug: string }[] | null;
}

interface ArticleShortResponse extends ArticleBase {
	tag: { id: number; name: string; slug: string } | null;
}

export async function getArticleFull(req: Request, res: Response) {
	const path = "/articles/full/:id";
	const query = `
			SELECT 
					a.id,
					a.name,
					a.updateddate::text AS updateddate,
					a.description,
					a.text,
					COALESCE(photos.urls, ARRAY[]::text[]) AS photo,
					COALESCE(tags.items, '[]'::json) AS tags
			FROM articles a
			LEFT JOIN LATERAL (
					SELECT array_agg(ap.url ORDER BY ap.position, ap.id) AS urls
					FROM article_photos ap
					WHERE ap.article_id = a.id
			) photos ON true
			LEFT JOIN LATERAL (
					SELECT json_agg(json_build_object('id', t.id, 'name', t.name, 'slug', t.slug, 'text_color', t.text_color, 'bg_color', t.bg_color) ORDER BY at.position) AS items
					FROM article_tags at
					JOIN tags t ON t.id = at.tag_id
					WHERE at.article_id = a.id
			) tags ON true
			WHERE a.id = $1
					AND a.visibility = true;
		`;
	getItemsById<ArticleFullResponse>(req, res, path, query);
}

const baseQuery = `
		SELECT 
			a.id,
			a.name,
			a.updateddate::text AS updateddate,
			photo.url AS photo,
			CASE 
				WHEN tag.id IS NULL THEN NULL 
				ELSE json_build_object('id', tag.id, 'name', tag.name, 'slug', tag.slug, 'text_color', tag.text_color, 'bg_color', tag.bg_color) 
			END AS tag
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
		) tag ON true
		WHERE
	`;

	export async function getArticleShort(req: Request, res: Response) {
		const path = "/articles/short/:ids";
		const query = baseQuery + 'a.id = ANY($1) AND a.visibility = true;';
		getItemsByIds<ArticleShortResponse>(req, res, path, query);
	}

	export async function getArticleRelated(req: Request, res: Response) {
		const path ='/articles/related/:id'
		const query = baseQuery + 'a.id != $1 AND a.visibility = true ORDER BY random() LIMIT 2';
		getItemsById<ArticleShortResponse>(req, res, path, query);
	}