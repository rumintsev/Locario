import Image from 'next/image';
import Link from 'next/link';

// ui
import Tag from '@/components/ui/Tag';

// css
import styles from './Article.module.css'
import BookmarkButton from './ui/BookmarkButton';

interface Article {
	id: number;
	name: string;
	updateddate: string; // 'YYYY-MM-DD'
	photo: string | null;
	tag: {
		id: number;
		name: string;
		slug: string,
		text_color: string,
		bg_color: string
	} | null;
}

export default function Article({ article }: { article: Article }) {
	return (
		<div className={styles.article}>

			{article.tag && (
				<Tag tag={article.tag} className={styles.tag} />
			)}

			<BookmarkButton className={styles.bookmark} />

			{article.tag &&
				<Tag className={styles.tag} tag={article.tag} />
			}
			{article.photo ? (
				<Link
					href={`/articles/${article.id}`}
					className={styles.photo}
				>
					<Image
						src={`/img/articles/${article.photo}`}
						alt='Article image'
						fill
						sizes="660px, 315px"
					/>
				</Link>
			) : (
				<Link
					href={`/articles/${article.id}`}
					className={styles.photoDummy}
				/>
			)}
			<Link href={`/articles/${article.id}`} className={styles.name}>
				{article.name}
			</Link>
			<p className={styles.extra}>{new Date(
				article.updateddate).toLocaleDateString('ru-RU', {
					day: 'numeric',
					month: 'long',
					year: 'numeric',
				}).replace(' г.', '')}
			</p>
		</div>
	)
}