'use client';

// css
import styles from './BookmarkButton.module.css'

// svg
import BookmarkIcon from '@/svg/smallBookmark.svg'

import { useEffect, useState } from 'react';
import { type Favourite, FavouritesSchema } from '@/schemas/schema'

export default function BookmarkButton({ className, itemInfo }: { className: string, itemInfo: Favourite }) {
	const [favourites, setFavourites] = useState<Favourite[]>([]);

	useEffect(() => {
		try {
			const raw = localStorage.getItem('favourites');
			if (raw === null) return;
			const result = FavouritesSchema.safeParse(JSON.parse(raw));
			if (result.success) setFavourites(result.data);
		} catch { }
	}, [])

	const isFavourite = favourites.some(fav => (fav.id === itemInfo.id && fav.type === itemInfo.type));

	const toggleFavourite = () => {
		let current: Favourite[] = [];
		try {
			const raw = localStorage.getItem('favourites');
			if (raw !== null) {
				const result = FavouritesSchema.safeParse(JSON.parse(raw));
				if (result.success) current = result.data;
			}
		} catch { }
		console.log(current)
		const newFavourite = current.some(fav => (fav.id === itemInfo.id && fav.type === itemInfo.type))
			? current.filter(fav => !(fav.id === itemInfo.id && fav.type === itemInfo.type))
			: [...current, itemInfo];
		setFavourites(newFavourite);
		localStorage.setItem('favourites', JSON.stringify(newFavourite));
	}

	return (
		<button
			className={`${styles.button} ${className}`}
			onClick={toggleFavourite}
		>
			{isFavourite ? <div className={styles.check} /> : <BookmarkIcon />}
		</button>
	)
}