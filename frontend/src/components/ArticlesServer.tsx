// css
import styles from './Articles.module.css'

// ui
import Headline from "@/components/ui/Headline";
import Error from "@/components/ui/Error";

import Article from "@/components/Article";
import { serverFetch } from "@/lib/serverFetch";
import { ArticlesSchema } from '@/schemas/schema';

export default async function Articles({
	headline,
	link,
	endpoint,
	className,
}: {
	headline: string,
	link?: string,
	endpoint: string,
	className?: string,
}) {
	const result = await serverFetch(endpoint, ArticlesSchema);
	const articles = result.success ? result.data : [];
	const hasError = !result.success;
	if (hasError) console.error(result.error)

	return (
		<div className={`${styles.articles} ${className}`}>
			<div className={styles.articlesContent}>

				<Headline headline={headline} link={link} />

				{articles.length > 0 ? (
					<div className={styles.articlesGrid}>
						{articles.map((article) => (
							<Article key={article.id} article={article} />
						))}
					</div>) : hasError ? (
						<Error text='Ошибка загрузки статей' />
					) : null}

			</div>
		</div>
	)
}