'use client';

// css
import styles from './Content.module.css';

import { useEffect, useState } from "react";
import { type Favourite, FavouritesSchema } from "@/schemas/schema";
import { fetchFromClientFavourites } from "@/app/favourites/_components/fetchFromClientFavourites";
import CollectionsClient from '@/components/CollectionsClient'
import ArticlesClient from '@/components/ArticlesClient'
import CardsClient from '@/components/CardsClient'

import {
	type Collection,
	type Article,
	type Card,
} from "@/schemas/schema";

export default function Content() {
	const [collections, setCollections] = useState<Collection[]>([]);
	const [articles, setArticles] = useState<Article[]>([]);
	const [places, setPlaces] = useState<Card[]>([]);
	const [cities, setCities] = useState<Card[]>([]);

	useEffect(() => {
		let favourites: Favourite[] = [];

		try {
			const raw = localStorage.getItem('favourites');
			if (raw === null) return;
			const result = FavouritesSchema.safeParse(JSON.parse(raw));
			if (result.success) favourites = result.data;
		} catch {
			console.error('Zod favourites type from local storage error');
		}

		const getIds = (type: string) => {
			return favourites
				.filter((item) => item.type === type)
				.map((item) => item.id)
				.join();
		}

		const collectionIds = getIds('collection');
		const articleIds = getIds('article');
		const placeIds = getIds('place');
		const cityIds = getIds('city');

		if (!collectionIds && !articleIds && !placeIds && !cityIds) return;

		let cancelled = false;

		const load = async () => {
			const result = await fetchFromClientFavourites({
				collectionIds: collectionIds,
				articleIds: articleIds,
				placeIds: placeIds,
				cityIds: cityIds,
			});
			if (!cancelled) {
				if (!result.success) {
					console.error(result.error)
					return
				}
				else {
					setCollections(result.data.collections);
					setArticles(result.data.articles);
					setPlaces(result.data.places);
					setCities(result.data.cities);
				}
			}
		};

		load();

	}, []);

	return (
		(
			collections.length > 0 ||
			articles.length > 0 ||
			places.length > 0 ||
			cities.length > 0
		) && (
			<div className={styles.content}>
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
			</div>
		)
	)
}