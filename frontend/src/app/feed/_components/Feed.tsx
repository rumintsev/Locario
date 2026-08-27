"use client";

// css
import styles from './Feed.module.css'

import { useEffect, useRef, useState } from "react";
import { clientFetch } from "@/app/actions/clientFetch";
import CardsClient from "@/components/CardsClient";
import ArticlesClient from '@/components/ArticlesClient';
import CollectionsClient from '@/components/CollectionsClient';
import { buildSearchParams } from './lib'
import {
	searchResultSchema,
	type SearchResult,
	type SearchItem,
	type Card,
	type Article,
	type Collection,
	type SearchParams,
	type types,
} from "@/schemas/schema";

const CATEGORIES: { label: string; slug: string }[] = [
	{ label: 'Новинка', slug: 'new' },
	{ label: 'Популярное', slug: 'popular' },
	{ label: 'Природа', slug: 'nature' },
	{ label: 'Туризм', slug: 'tourism' },
	{ label: 'Здоровье', slug: 'health' },
	{ label: 'Активность', slug: 'activity' },
];

const CONTENT_TYPES: { label: string; value: types }[] = [
	{ label: 'Подборки', value: 'collection' },
	{ label: 'Статьи', value: 'article' },
	{ label: 'Места', value: 'place' },
	{ label: 'Города', value: 'city' },
];

function toCardOrArticle(item: SearchItem): Card | Article {
	return {
		id: item.id,
		name: item.name,
		updateddate: item.updateddate ?? '',
		photo: item.photos[0] ?? null,
		tag: item.tag,
	};
}
function toCollection(item: SearchItem): Collection {
	return {
		id: item.id,
		name: item.name,
		type: item.collection_type ?? 'places',
		updateddate: item.updateddate ?? '',
		photos: item.photos ?? null,
		tag: item.tag,
		cards_count: item.cards_count ?? 0,
	};
}

export function Feed({ initialTypes, initialTags, initialResult }: {
	initialTypes: ('city' | 'place' | 'article' | 'collection' | 'tag')[];
	initialTags: string[];
	initialResult: SearchResult;
}) {
	const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
	const [selectedTypes, setSelectedTypes] = useState<types[]>(initialTypes);
	const [searchResult, setSearchResult] = useState<SearchResult>(initialResult);

	const isFirstRender = useRef(true);

	const toggleTag = (slug: string) => {
		setSelectedTags((prev) =>
			prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
		);
	};

	const toggleType = (value: types) => {
		setSelectedTypes((prev) =>
			prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
		);
	};

	const handleReset = () => {
		setSelectedTags([]);
	};

	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}

		let cancelled = false;

		const timeout = setTimeout(async () => {
			try {
				const params = buildSearchParams({ types: selectedTypes, tags: selectedTags });
				const data = await clientFetch(`/search/full?${params}`);

				if (cancelled) return;

				const result = searchResultSchema.safeParse(data);

				if (result.success) {
					setSearchResult(result.data);
				} else {
					console.error('Error format from /search/full:', result.error);
				}
			} catch (error) {
				if (cancelled) return;
				console.error('Fetch error:', error);
			}
		}, 1000);

		return () => {
			cancelled = true;
			clearTimeout(timeout);
		}
	}, [selectedTags, selectedTypes]);

	return (
		<div className={styles.feed}>
			<div className={styles.menu}>
				<div>
					<div className={styles.categoriesBar}>
						<h3>Категории</h3>
						<button type="button" onClick={handleReset}>Сбросить</button>
					</div>
					<div className={styles.checkboxes}>
						{CATEGORIES.map(({ label, slug }) => (
							<label key={slug}>
								<input
									type="checkbox"
									name="categories"
									checked={selectedTags.includes(slug)}
									onChange={() => toggleTag(slug)}
								/>
								<span>{label}</span>
							</label>
						))}
					</div>
				</div>
				<div>
					<h3>Тип контента</h3>
					<div className={styles.checkboxes}>
						{CONTENT_TYPES.map(({ label, value }) => (
							<label key={value}>
								<input
									type="checkbox"
									name="content-type"
									checked={selectedTypes.includes(value)}
									onChange={() => toggleType(value)}
								/>
								<span>{label}</span>
							</label>
						))}
					</div>
				</div>
			</div>

			<CollectionsClient
				headline='Подборки'
				collections={searchResult.data.filter((item) => item.type === 'collection').map(toCollection)}
			/>

			<ArticlesClient
				headline="Статьи"
				articles={searchResult.data.filter((item) => item.type === 'article').map(toCardOrArticle)}
			/>

			<CardsClient
				headline="Места"
				type="place"
				cards={searchResult.data.filter((item) => item.type === 'place').map(toCardOrArticle)}
			/>

			<CardsClient
				headline="Города"
				type="city"
				cards={searchResult.data.filter((item) => item.type === 'city').map(toCardOrArticle)}
			/>
		</div>
	);
}