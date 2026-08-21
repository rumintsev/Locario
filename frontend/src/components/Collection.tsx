import Image from 'next/image'
import Link from 'next/link';

// css
import styles from './Collection.module.css'

interface Collection {
	id: number;
	name: string;
	type: "places" | "cities";
	updateddate: string; // 'YYYY-MM-DD'
	cards_count: number;
	photos: string[] | null;
	tag: { id: number; name: string; slug: string, text_color: string, bg_color: string } | null;
}

export default function Collection({ collection }: { collection: Collection }) {
	return (
		<div className={styles.collection}>
			<div className={styles.photos}>
				{collection.photos && (
					<>
						<Image src={`/img/${collection.photos[0]}`} alt='First collection image' width={100} height={100}/>
						<Image src={`/img/${collection.photos[1]}`} alt='Second collection image' width={100} height={100}/>
					</>
				)}
			</div>
			{collection.tag && (<p style={{
				color: collection.tag.text_color,
				background: collection.tag.bg_color
			}}>{collection.tag.name}</p>)}
			<Link href={`/collections/${collection.id}`}>{collection.name}</Link>
			<p>
				{new Date(
					collection.updateddate).toLocaleDateString('ru-RU', {
						day: 'numeric',
						month: 'long',
						year: 'numeric',
					}).replace(' г.', '')}
				<span />
				{collection.cards_count}
			</p>
		</div>
	)
}