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
	type: "places" | "cities" | 'countries';
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
		<div className={styles.collectionComponent}>
			<div className={styles.collection}>

				<BookmarkButton
					className={styles.bookmark}
					itemInfo={{ id: collection.id, type: 'collection' }}
				/>

				<Link
					href={`/collections/${collection.id}`}
					className={styles.photos}
				>
					{collection.photos.length >= 2 ? (
						collection.photos.map((photo, i) => (
							<div className={styles.photoGrid} key={i}>
								<div className={styles.photo}>
									<Image
										src={`/img/${collection.type}/${photo}`}
										alt='First collection image'
										fill
										sizes="150px, 190px"
									/>
								</div>
							</div>
						))
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
				</Link>

				<div className={styles.collectionDescription}>
					{collection.tag && (
						<Tag tag={collection.tag} />
					)}

					<Link
						className={styles.name}
						href={`/collections/${collection.id}`}
					>{collection.name}</Link>
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
		</div>
	)
}