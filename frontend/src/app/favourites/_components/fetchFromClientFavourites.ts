'use server';

import { z } from 'zod';
import {
	CollectionsSchema,
	ArticlesSchema,
	CardsSchema,
	type Collection,
	type Article,
	type Card,
} from "@/schemas/schema";

type FetchResult<T> =
	| { success: true; data: T }
	| { success: false; error: string };

async function fetchAndValidate<T>({ endpoint, schema }:
	{ endpoint: string, schema: z.ZodType<T> }):
	Promise<FetchResult<T>> {

	try {
		const res = await fetch(`${process.env.DOMAIN || 'http://localhost:3001'}${endpoint}`);

		if (!res.ok) {
			return { success: false, error: `HTTP ${res.status}: ${res.statusText}` };
		}

		const data = await res.json();
		const result = schema.safeParse(data);

		if (!result.success) {
			console.error(`Zod validation error for ${endpoint}:`, result.error);
			return { success: false, error: 'Invalid data format' };
		}

		return { success: true, data: result.data };
	} catch (err) {
		console.error(`Fetch error for ${endpoint}:`, err);
		return { success: false, error: 'Network error' };
	}
}

export async function fetchFromClientFavourites({
	collectionIds,
	articleIds,
	placeIds,
	cityIds,
}: {
	collectionIds: string,
	articleIds: string,
	placeIds: string,
	cityIds: string,
}): Promise<FetchResult<{
	collections: Collection[],
	articles: Article[],
	places: Card[],
	cities: Card[]
}>> {
	const collectionsResult = await fetchAndValidate({
		endpoint: `/collections/short/${collectionIds}`,
		schema: CollectionsSchema
	});

	const articlesResult = await fetchAndValidate({
		endpoint: `/articles/short/${articleIds}`,
		schema: ArticlesSchema
	});

	const placesResult = await fetchAndValidate({
		endpoint: `/places/short/${placeIds}`,
		schema: CardsSchema
	});

	const citiesResult = await fetchAndValidate({
		endpoint: `/cities/short/${cityIds}`,
		schema: CardsSchema
	});

	if (
		!collectionsResult.success &&
		!articlesResult.success &&
		!placesResult.success &&
		!citiesResult.success
	) return { success: false, error: 'Zod or network error' }
	else {
		return {
			success: true, data: {
				collections: collectionsResult.success ? collectionsResult.data : [],
				articles: articlesResult.success ? articlesResult.data : [],
				places: placesResult.success ? placesResult.data : [],
				cities: citiesResult.success ? citiesResult.data : [],
			}
		}
	}
};