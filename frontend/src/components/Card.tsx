import Image from 'next/image';
import Link from 'next/link';

// css
import styles from './Card.module.css'

// ui
import BookmarkButton from '@/components/ui/BookmarkButton'
import Tag from '@/components/ui/Tag';

//svg
import StarIcon from '@/svg/star.svg';

interface Card {
	id: number;
	name: string;
	rate?: number | null;
	updateddate: string; // 'YYYY-MM-DD'
	photo: string | null;
	tag: {
		id: number;
		name: string;
		slug: string;
		text_color: string;
		bg_color: string;
	} | null;
}

const types: Record<string, string> = {
	'place': 'places',
	'city': 'cities'
}

export default function Card({ card, type }: { card: Card, type: 'place' | 'city' }) {
	return (
		<div className={styles.card}>

			<BookmarkButton
				className={styles.bookmark}
				itemInfo={{ id: card.id, type: type }}
			/>

			{card.photo ? (
				<Link
					href={`/${types[type]}/${card.id}`}
					className={styles.photo}
				>
					<Image
						src={`/img/${types[type]}/${card.photo}`}
						alt='Card image'
						fill
						sizes="150px, 190px"
					/>
				</Link>
			) : (
				<Link
					href={`/${types[type]}/${card.id}`}
					className={styles.photoDummy}
				/>
			)}

			<div className={styles.cardDescription}>
				{(card.rate || card.tag) && (
					<div className={styles.tagBar}>
						{card.rate && (
							<p className={styles.rate}>
								<StarIcon />
								{card.rate.toFixed(1)}
							</p>
						)}
						{card.tag && (
							<Tag tag={card.tag} />
						)}
					</div>
				)}

				<Link
					className={styles.name}
					href={`/${types[type]}/${card.id}`}
				>{card.name}</Link>
				<p className={styles.extra}>{new Date(
					card.updateddate).toLocaleDateString('ru-RU', {
						day: 'numeric',
						month: 'long',
						year: 'numeric',
					}).replace(' г.', '')}
				</p>
			</div>
		</div>
	)
}