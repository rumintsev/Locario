// css
import styles from './page.module.css'

// svg
import CompasIcon from '@/svg/compas.svg'

import { serverFetch } from "@/lib/serverFetch";
import { buildSearchParams } from './_components/lib'
import {
	SearchParamsSchema,
	searchResultSchema,
	type SearchParams,
	type types,
} from "@/schemas/schema";
import { Feed } from "./_components/Feed";

export default async function FeedPage({ searchParams }: {
	searchParams: Promise<SearchParams>
}) {

	const rawParams = await searchParams;
	const parsed = SearchParamsSchema.safeParse(rawParams);
	if (!parsed.success) console.error(parsed.error);
	const initial = parsed.success ? parsed.data : SearchParamsSchema.parse({});
	const params = buildSearchParams(initial);

	const searchResult = await serverFetch(`/search/full?${params}`, searchResultSchema);

	return (
		<div className={styles.feedPage}>
			<div className={styles.feedPageContent}>

				<div className={styles.pageName}>
					<h1>Лента</h1>
					<CompasIcon />
				</div>

				<p className={styles.feedDescription}>Вдохновение для ваших путешествий</p>

				{searchResult.success ? (<Feed
					initialTypes={initial.types || []}
					initialTags={initial.tags || []}
					initialResult={searchResult.data}
				/>
				) : (
					<p style={{
						textAlign: 'center',
						color: 'red'
					}}>Ошибка загрузки контента</p>
				)}

			</div>
		</div>
	);
}