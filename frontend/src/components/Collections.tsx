import { z } from 'zod';

// ui
import Headline from "@/components/ui/Headline";
import Error from "@/components/ui/Error";

// css
import styles from './Collections.module.css'

import Collection from "@/components/Collection";
import { serverFetch } from "@/lib/serverFetch";

const CollectionsSchema = z.array(z.object({
	id: z.number(),
	name: z.string(),
	type: z.enum(["places", "cities", 'countries']),
	updateddate: z.string(), // 'YYYY-MM-DD'
	cards_count: z.number(),
	photos: z.array(z.string()),
	tag: z.object({
		id: z.number(),
		name: z.string(),
		slug: z.string(),
		text_color: z.string(),
		bg_color: z.string()
	}).nullable()
}));

type Collections = z.infer<typeof CollectionsSchema>;

export default async function Collections({
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

	const result = await serverFetch(endpoint, CollectionsSchema);

	const collections = result.success ? result.data : [];
	const hasError = !result.success;
	if (hasError) console.error(result.error)

	return (
		<div className={`${styles.collections} ${className}`}>
			<div className={styles.collectionsContent}>
				<Headline headline={headline} link={link} />
				{collections.length > 0 ? (
					<div className={styles.collectionsGrid}>
						{collections.slice(0, 4).map((collection) => (
							<Collection key={collection.id} collection={collection} />
						))}
					</div>) : hasError ? (
						<Error text='Ошибка загрузки подборок' />
					) : null}
			</div>
		</div>)
}