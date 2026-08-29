'use client';

import { useEffect, useState } from "react";
import { type Favourite, FavouritesSchema } from "@/schemas/schema";
// import { clientFetch } from "@/app/actions/clientFetchNew";
import CollectionsClient from '@/components/CollectionsClient'
import ArticlesClient from '@/components/ArticlesClient'
import CardsClient from '@/components/CardsClient'

import {
	CollectionsSchema,
	ArticlesSchema,
	CardsSchema,
	type Collection,
	type Article,
	type Card,
} from "@/schemas/schema";

export default function Content() {
	const [collections, setCollections] = useState<Collection[]>([]);
	const [articles, setArticles] = useState<Article[]>([]);
	const [places, setPlaces] = useState<Card[]>([]);
	const [cities, setCities] = useState<Card[]>([]);

	// useEffect(() => {
	// 	let favourites: Favourite[] = [];

	// 	try {
	// 		const raw = localStorage.getItem('favourites');
	// 		if (raw === null) return;
	// 		const result = FavouritesSchema.safeParse(JSON.parse(raw));
	// 		if (result.success) favourites = result.data;
	// 	} catch { }

	// 	const collectionIds = favourites
	// 		.filter((item) => item.type === 'collection')
	// 		.map((item) => item.id)
	// 		.join();

	// 	const articleIds = favourites
	// 		.filter((item) => item.type === 'article')
	// 		.map((item) => item.id)
	// 		.join();

	// 	const placeIds = favourites
	// 		.filter((item) => item.type === 'place')
	// 		.map((item) => item.id)
	// 		.join();

	// 	const cityIds = favourites
	// 		.filter((item) => item.type === 'city')
	// 		.map((item) => item.id)
	// 		.join();

	// 	if (!collectionIds && !articleIds && !placeIds && !cityIds) return;

	// 	async function fetchData() {
	// 		const collectionsResult = await clientFetch(
	// 			`/collections/short/${collectionIds}`,
	// 			CollectionsSchema
	// 		);
	// 		console.log(collectionsResult)
	// 		if (collectionsResult.success) {
	// 			setCollections(collectionsResult.data);
	// 		}

	// 		const articlesResult = await clientFetch(
	// 			`/articles/short/${articleIds}`,
	// 			ArticlesSchema
	// 		);
	// 		if (articlesResult.success) {
	// 			setArticles(articlesResult.data);
	// 		}

	// 		const placesResult = await clientFetch(
	// 			`/places/short/${placeIds}`,
	// 			CardsSchema
	// 		);
	// 		if (placesResult.success) {
	// 			setPlaces(placesResult.data);
	// 		}

	// 		const citiesResult = await clientFetch(
	// 			`/cities/short/${cityIds}`,
	// 			CardsSchema
	// 		);
	// 		if (citiesResult.success) {
	// 			setCities(citiesResult.data);
	// 		}
	// 	}

	// 	fetchData();
	// }, []);

	return (
		<>
			{collections.length > 0 &&
				<CollectionsClient
					headline='Подборки'
					collections={collections}
				/>
			}
			{articles.length > 0 &&
				<ArticlesClient
					headline="Статьи"
					articles={articles}
				/>
			}
			{places.length > 0 &&
				<CardsClient
					headline="Места"
					type="place"
					cards={places}
				/>
			}
			{cities.length > 0 &&
				<CardsClient
					headline="Города"
					type="city"
					cards={cities}
				/>
			}
		</>
	)
}