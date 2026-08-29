"use client";

// css
import styles from './Feed.module.css'

//svg
import NextIcon from '@/svg/next.svg'

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
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
	type Tag,
	type types,
} from "@/schemas/schema";
import Tags from '@/components/Tags';

const CATEGORIES: { label: string; slug: string }[] = [
	{ label: 'Новинка', slug: 'new' },
	{ label: 'Популярное', slug: 'popular' },
	{ label: 'Природа', slug: 'nature' },
	{ label: 'Туризм', slug: 'tourism' },
	{ label: 'Здоровье', slug: 'health' },
	{ label: 'Активность', slug: 'activity' },
	{ label: 'Петербург', slug: 'petersburg' },
	{ label: 'Беларусь', slug: 'belarus' },
	{ label: 'Музеи', slug: 'museum' },
	{ label: 'Кафе', slug: 'cafe' },
	{ label: 'Семьёй', slug: 'family' },
	{ label: 'Бесплатно', slug: 'free' },
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

function toTag(item: SearchItem): Tag {
	return {
		id: item.id,
		name: item.name,
		slug: item.slug || '',
		text_color: item.text_color || '',
		bg_color: item.bg_color || '',
	};
}

function Content(searchItems: SearchItem[]) {
	const tags = searchItems.filter((item) => item.type === 'tag').map(toTag);
	const collections = searchItems.filter((item) => item.type === 'collection').map(toCollection);
	const articles = searchItems.filter((item) => item.type === 'article').map(toCardOrArticle);
	const places = searchItems.filter((item) => item.type === 'place').map(toCardOrArticle);
	const cities = searchItems.filter((item) => item.type === 'city').map(toCardOrArticle);

	return (
		searchItems.length > 0 ? (
			<>
				{tags.length > 0 &&
					<Tags
						headline='Категории'
						tags={tags}
					/>
				}
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
		) : (
			<h2 className={styles.notFound}>Ничего не нашлось</h2>
		)
	)
}

export function Feed({ initialTypes, initialTags, initialResult, initialQuery }: {
	initialTypes: types[],
	initialTags: string[],
	initialResult: SearchResult,
	initialQuery: string;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const urlSearchParams = useSearchParams();

	const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
	const [selectedTypes, setSelectedTypes] = useState<types[]>(initialTypes);
	const [searchItems, setSearchItems] = useState<SearchItem[]>(initialResult.data);
	const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
	const [isFullTags, setIsFullTags] = useState<boolean>(false);
	const [pageParams, setPageParams] = useState<{
		page: number,
		totalPages: number,
	}>({
		page: initialResult.page,
		totalPages: initialResult.totalPages,
	});

	const isFirstRender = useRef(true);

	const toggleTag = (slug: string) => {
		setSelectedTags((prev) =>
			prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
		);
		setPageParams(prev => ({ ...prev, page: 1 }));
	};

	const toggleType = (value: types) => {
		setSelectedTypes((prev) =>
			prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
		);
		setPageParams(prev => ({ ...prev, page: 1 }));
	};

	const handleTagsReset = () => {
		setSelectedTags([]);
		setPageParams(prev => ({ ...prev, page: 1 }));
	};

	const handleTypesReset = () => {
		setSelectedTypes([]);
		setPageParams(prev => ({ ...prev, page: 1 }));
	};

	useEffect(() => {
		const urlQuery = urlSearchParams.get('q') ?? '';
		if (searchQuery !== urlQuery) {
			setSearchQuery(urlQuery);
			setPageParams(prev => ({ ...prev, page: 1 }))
		}
		const urlTag = urlSearchParams.get('tags') ?? '';
		if (selectedTags.join(',') !== urlTag) {
			setSelectedTags(urlTag === '' ? [] : [urlTag]);
			setPageParams(prev => ({ ...prev, page: 1 }))
		}
	}, [urlSearchParams]);

	useEffect(() => {
		const params = buildSearchParams({
			types: selectedTypes,
			tags: selectedTags,
			page: pageParams.page,
			q: searchQuery,
		});
		const url = params ? `${pathname}?${params}` : pathname;
		router.replace(url, { scroll: false });
	}, [selectedTypes, selectedTags, pageParams.page, searchQuery]);

	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}

		let cancelled = false;
		const timeout = setTimeout(async () => {
			try {
				const params = buildSearchParams({
					types: selectedTypes,
					tags: selectedTags,
					page: pageParams.page,
					q: searchQuery
				});
				const data = await clientFetch(`/search/full?${params}`);

				if (cancelled) return;

				const result = searchResultSchema.safeParse(data);

				if (result.success) {
					setSearchItems(result.data.data);
					setPageParams({ page: result.data.page, totalPages: result.data.totalPages });
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
	}, [selectedTags, selectedTypes, pageParams.page, searchQuery]);

	function handlePageChange(i: number) {
		setPageParams(prev => ({ ...prev, page: i }))
		window.scrollTo({ top: 0, behavior: 'auto' })
	}

	function PageButtons({ page, totalPages }: { page: number, totalPages: number }) {
		const MAX_BUTTONS = 4;
		let startPage, endPage;

		if (totalPages <= MAX_BUTTONS) {
			startPage = 1;
			endPage = totalPages;
		} else if (page <= 2) {
			startPage = 1;
			endPage = MAX_BUTTONS;
		} else if (page >= totalPages - 1) {
			startPage = totalPages - MAX_BUTTONS + 1;
			endPage = totalPages;
		} else {
			startPage = page - 1;
			endPage = page + MAX_BUTTONS - 2;
		}

		const pageNumbers: React.ReactElement[] = [];

		for (let i = startPage; i <= endPage; i++) {
			pageNumbers.push(
				<button
					key={i}
					className={styles.pageNumber}
					onClick={() => handlePageChange(i)}
					disabled={i === page}
				>
					{i}
				</button>
			);
		}
		return (
			<div className={styles.pageToggler}>
				<button
					className={styles.prev}
					onClick={() => handlePageChange(page - 1)}
					disabled={page === 1}
				>
					<NextIcon />
				</button>
				{pageNumbers}
				<button
					className={styles.next}
					onClick={() => handlePageChange(page + 1)}
					disabled={page >= totalPages}
				>
					<NextIcon />
				</button>
			</div>
		);

	}

	return (
		<div className={styles.feed}>

			<div className={styles.menuContainer}>
				<div className={styles.menu}>
					<div>
						<div className={styles.categoriesBar}>
							<h3>Категории</h3>
							<button type="button" onClick={handleTagsReset}>Сбросить</button>
						</div>
						<div className={styles.checkboxes}>
							{CATEGORIES
								.slice(0, isFullTags ? CATEGORIES.length : 6)
								.map(({ label, slug }) => (
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
							<button
								className={styles.moreTags}
								onClick={() => setIsFullTags(!isFullTags)}
							>
								{isFullTags ? 'Показать меньше' : 'Показать ещё'}</button>
						</div>
					</div>
					<div>
						<div className={styles.categoriesBar}>
							<h3>Тип контента</h3>
							<button type="button" onClick={handleTypesReset}>Сбросить</button>
						</div>
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
			</div>

			<div className={styles.content}>

				{Content(searchItems)}

				{PageButtons({
					page: pageParams.page,
					totalPages: pageParams.totalPages,
				})}

			</div>

		</div >
	);
}