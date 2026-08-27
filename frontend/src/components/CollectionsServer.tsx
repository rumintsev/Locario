// ui
import Headline from "@/components/ui/Headline";
import Error from "@/components/ui/Error";

// css
import styles from './Collections.module.css'

import Collection from "@/components/Collection";
import { serverFetch } from "@/lib/serverFetch";
import { CollectionsSchema } from '@/schemas/schema'

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