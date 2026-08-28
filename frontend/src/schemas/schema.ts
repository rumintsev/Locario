import { z } from 'zod';

export type types = 'city' | 'place' | 'article' | 'collection' | 'tag';

// tag
const TagSchema = z.object({
	id: z.number(),
	name: z.string(),
	slug: z.string(),
	text_color: z.string(),
	bg_color: z.string(),
})

// card is place or city
export const CardSchema = z.object({
	id: z.number(),
	name: z.string(),
	rate: z.number().nullable().optional(),
	updateddate: z.string(), // 'YYYY-MM-DD'
	photo: z.string().nullable(),
	tag: TagSchema.nullable(),
});

export const CardsSchema = z.array(CardSchema);
export type Card = z.infer<typeof CardSchema>;
export type Cards = z.infer<typeof CardsSchema>;

// article
export const ArticleSchema = z.object({
	id: z.number(),
	name: z.string(),
	updateddate: z.string(), // 'YYYY-MM-DD'
	photo: z.string().nullable(),
	tag: TagSchema.nullable()
});

export const ArticlesSchema = z.array(ArticleSchema);
export type Article = z.infer<typeof ArticleSchema>;
export type Articles = z.infer<typeof ArticlesSchema>;

// collection
const CollectionSchema = z.object({
	id: z.number(),
	name: z.string(),
	type: z.enum(["places", "cities", 'countries']),
	updateddate: z.string(), // 'YYYY-MM-DD'
	cards_count: z.number(),
	photos: z.array(z.string()),
	tag: z.object({
		id: z.number(),
		name: z.string(),
		slug: z.string(),
		text_color: z.string(),
		bg_color: z.string()
	}).nullable()
});
export const CollectionsSchema = z.array(CollectionSchema);
export type Collection = z.infer<typeof CollectionSchema>;
export type Collections = z.infer<typeof CollectionsSchema>;

// search
export const SearchParamsSchema = z.object({
	q: z.string().optional(),
	page: z.coerce.number().int().int().positive().optional(),
	types: z
		.string()
		.transform((val) => (val ? val.split(",") : []))
		.pipe(z.array(z.enum(['city', 'place', 'article', 'collection', 'tag'])))
		.optional(),
	tags: z
		.string()
		.transform((val) => (val ? val.split(",") : []))
		.optional(),
});

export type SearchParams = z.infer<typeof SearchParamsSchema>;

const SearchItemSchema = z.object({
	type: z.enum(['city', 'place', 'article', 'collection', 'tag']),
	id: z.number(),
	name: z.string(),
	slug: z.string().nullable(),
	loc: z.string().nullable(),
	photos: z.array(z.string()),
	tag: TagSchema.nullable(),
	updateddate: z.string().nullable(),
	collection_type: z.enum(['cities', 'places', 'countries']).nullable(),
	cards_count: z.number().nullable(),
})

export type SearchItem = z.infer<typeof SearchItemSchema>;

export const searchResultSchema = z.object({
	data: z.array(SearchItemSchema),
	page: z.number(),
	limit: z.number(),
	total: z.number(),
	totalPages: z.number(),
})

export type SearchResult = z.infer<typeof searchResultSchema>;