// css
import styles from './Articles.module.css'

// ui
import Headline from "@/components/ui/Headline";

import Article from "@/components/Article";
import { type Articles } from '@/schemas/schema';


export default function Articles({
	headline,
	className,
	articles,
}: {
	headline: string,
	className?: string,
	articles: Articles,
}) {
	return (
		<div className={`${styles.articles} ${className}`}>
			<div className={styles.articlesContent}>

				<Headline headline={headline} />

				{articles.length > 0 && (
					<div className={styles.articlesGrid}>
						{articles.map((article) => (
							<Article key={article.id} article={article} />
						))}
					</div>)
				}

			</div>
		</div>
	)
}