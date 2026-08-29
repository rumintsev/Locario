"use client";

import { z } from "zod";
import { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { clientFetch } from "../app/actions/clientFetch";

// css
import styles from './Header.module.css';

// svg
import SearchIcon from '@/svg/search.svg';
import FavouriteIcon from '@/svg/bookmark.svg';
import ProfileIcon from '@/svg/profile.svg';
import LogoIcon from '@/svg/logo.svg';
import CrossIcon from "../svg/cross.svg";

const searchResultSchema = z.object({
	type: z.enum(['place', 'city', 'country', 'collection', 'tag']),
	id: z.number(),
	name: z.string(),
	slug: z.string().nullable(),
});

const searchResultArraySchema = z.array(searchResultSchema);
type SearchResultShort = z.infer<typeof searchResultSchema>;

type ShortItemType = 'place' | 'city' | 'country' | 'collection';
type FullItemType = 'place' | 'city' | 'country' | 'collection' | 'tag';

const typeToPath: Record<ShortItemType, string> = {
	place: 'places',
	city: 'cities',
	country: 'countries',
	collection: 'collections',
};

const typeToName: Record<FullItemType, string> = {
	place: 'Место',
	city: 'Город',
	country: 'Страна',
	collection: 'Подборка',
	tag: 'Категория',
};

export default function Header() {
	const router = useRouter();
	const [searchTerm, setSearchTerm] = useState("");
	const [searchResult, setSearchResult] = useState<SearchResultShort[]>([]);
	const [hasFetched, setHasFetched] = useState(false);
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [isMobile, setIsMobile] = useState(false)

	useEffect(() => {
		const mediaQuery = window.matchMedia(`(max-width: ${799 - 1}px)`)

		setIsMobile(mediaQuery.matches)

		const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
		mediaQuery.addEventListener('change', handler)

		return () => mediaQuery.removeEventListener('change', handler)
	}, [])

	useEffect(() => {
		if (!searchTerm) {
			setSearchResult([]);
			setHasFetched(false);
			return;
		}

		let cancelled = false;

		const timeout = setTimeout(async () => {
			try {
				const data = await clientFetch(`/search/short?q=${encodeURIComponent(searchTerm)}`);

				if (cancelled) return;

				const result = searchResultArraySchema.safeParse(data);

				if (result.success) {
					setSearchResult(result.data);
				} else {
					console.error('Error fromat from /search/short:', result.error);
					setSearchResult([]);
				}
				setHasFetched(true);
			} catch (error) {
				if (cancelled) return;
				setSearchResult([]);
				setHasFetched(true);
			}
		}, 1000);

		return () => {
			cancelled = true;
			clearTimeout(timeout);
		}
	}, [searchTerm]);

	const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(event.target.value);

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter") {
			setIsSearchOpen(false);
			clearSearch();
			router.push(!searchTerm ? "/feed" : `/feed?q=${encodeURIComponent(searchTerm)}`);
		}
	};

	const clearSearch = () => {
		setSearchTerm("");
		setSearchResult([]);
		setHasFetched(false);
	};

	const searchInputRef = useRef<HTMLInputElement>(null);

	const handleIconClick = () => {
		if (!isSearchOpen) {
			setIsSearchOpen(true);
			setTimeout(() => {
				searchInputRef.current?.focus();
			}, 100);
		} else {
			setIsSearchOpen(false);
			clearSearch();
		}
	};

	return (
		<header className={styles.header}>
			<div className={styles.headerContent}>

				<nav className={styles.nav}>
					<Link className={styles.logo}
						href={'/'}
					>
						<LogoIcon />
						<span>Locario</span>
					</Link>
					<Link
						href={'/feed'}
						style={{ display: !isSearchOpen ? 'block' : 'none' }}
					>Лента</Link>
				</nav>

				<div className={styles.search}>
					<input
						type="text"
						ref={searchInputRef}
						placeholder="Найти..."
						value={searchTerm}
						onChange={handleSearch}
						onKeyDown={handleKeyDown}
						style={{ display: isSearchOpen ? 'block' : 'none' }}
					/>

					{searchTerm && hasFetched && (
						<ul className={styles.searchResults}>
							{searchResult.length > 0 ? (
								searchResult.map((item, i) => (
									<li
										key={`${item.type}-${item.id}`}
										onClick={() => {
											if (item.type === 'tag') {
												router.push(`/feed?tags=${item.slug}`)
											} else {
												router.push(`/${typeToPath[item.type]}/${item.id}`);
											} setSearchTerm("");
										}}
									>
										<div>
											<p>{item.name}</p>
											<span>{typeToName[item.type]}</span>
										</div>
									</li>
								))
							) : (
								<li key="0" onClick={clearSearch}>
									Ничего не найдено
								</li>
							)}
						</ul>
					)}
					<SearchIcon
						onClick={handleIconClick}
						style={{ display: !isSearchOpen ? 'block' : 'none' }}
					/>
					<CrossIcon
						onClick={handleIconClick}
						style={{ display: isSearchOpen ? 'block' : 'none' }}
					/>
				</div>

				<div
					className={styles.icons}
					style={{ display: isSearchOpen && isMobile ? 'none' : 'flex' }}
				>
					<Link href={'/favourites'}><FavouriteIcon /></Link>
					<Link href={'/'}><ProfileIcon /></Link>
				</div>
			</div>
		</header >
	);
}