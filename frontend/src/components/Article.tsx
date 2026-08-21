// css
import styles from './Article.module.css'

interface Article {
	id: number;
	name: string;
	updateddate: string; // 'YYYY-MM-DD'
	photo: string | null;
	tag: { id: number; name: string; slug: string } | null;
}

export default function Article({ article }: { article: Article }) {
	return (
		<div className={styles.article}>
		</div>
	)
}