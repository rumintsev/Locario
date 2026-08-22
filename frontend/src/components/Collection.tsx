import Image from 'next/image'
import Link from 'next/link';

// ui
import BookmarkButton from '@/components/ui/BookmarkButton';
import Tag from '@/components/ui/Tag';

// css
import styles from './Collection.module.css'

interface Collection {
	id: number;
	name: string;
	type: "places" | "cities";
	updateddate: string; // 'YYYY-MM-DD'
	cards_count: number;
	photos: string[];
	tag: {
		id: number;
		name: string;
		slug: string,
		text_color: string,
		bg_color: string
	} | null;
}

export default function Collection({ collection }: { collection: Collection }) {
	return (
		<div className={styles.collection}>

			<BookmarkButton className={styles.bookmark} />

			<div className={styles.photos}>
				{collection.photos.length >= 2 ? (
					<>
						<div className={styles.photoGrid}>
							<div className={styles.photo}>
								<Image src={`/img/${collection.photos[0]}`} alt='First collection image' fill />
							</div>
						</div>
						<div className={styles.photoGrid}>
							<div className={styles.photo}>
								<Image src={`/img/${collection.photos[1]}`} alt='Second collection image' fill />
							</div>
						</div>
					</>
				) : (
					<>
						<div className={styles.photoGrid}>
							<div className={styles.photoDummy} />
						</div>
						<div className={styles.photoGrid}>
							<div className={styles.photoDummy} />
						</div>
					</>
				)}
			</div>

			<div className={styles.collectionDescription}>
				{collection.tag && (
					<Tag tag={collection.tag} />
				)}

				<Link href={`/collections/${collection.id}`}>{collection.name}</Link>
				<p className={styles.extra}>
					{collection.cards_count} карточек <span /> {new Date(
						collection.updateddate).toLocaleDateString('ru-RU', {
							day: 'numeric',
							month: 'long',
							year: 'numeric',
						}).replace(' г.', '')}
				</p>
			</div>
		</div>
	)
}