import Image from 'next/image';
import Link from 'next/link';

// css
import styles from './Place.module.css'

// ui
import BookmarkButton from '@/components/ui/BookmarkButton'
import Tag from '@/components/ui/Tag';

//svg
import StarIcon from '@/svg/star.svg';

interface Place {
	id: number;
	name: string;
	rate: number | null;
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

export default function Place({ place }: { place: Place }) {
	return (
		<div className={styles.place}>

			<BookmarkButton className={styles.bookmark} />

			<div className={styles.photos}>
				{place.photo ? (
					<div className={styles.photo}>
						<Image
							src={`/img/places/${place.photo}`}
							alt='Place image'
							fill
							sizes="150px, 190px"
						/>
					</div>
				) : (
					<div className={styles.photoDummy} />
				)}
			</div>

			<div className={styles.placeDescription}>
				<div className={styles.tagBar}>
					{place.rate && (
						<p className={styles.rate}>
							<StarIcon />
							{place.rate}
						</p>
					)}
					{place.tag && (
						<Tag tag={place.tag} />
					)}
				</div>

				<Link href={`/places/${place.id}`}>{place.name}</Link>
				<p className={styles.extra}>{new Date(
					place.updateddate).toLocaleDateString('ru-RU', {
						day: 'numeric',
						month: 'long',
						year: 'numeric',
					}).replace(' г.', '')}
				</p>
			</div>
		</div>
	)
}