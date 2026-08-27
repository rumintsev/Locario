// ui
import Headline from "@/components/ui/Headline";

// css
import styles from './Collections.module.css'

import Collection from "@/components/Collection";
import { type Collections } from '@/schemas/schema'

export default function Collections({
	headline,
	className,
	collections,
}: {
	headline: string,
	className?: string,
	collections: Collections,
}) {

	return (
		<div className={`${styles.collections} ${className}`}>
			<div className={styles.collectionsContent}>
				<Headline headline={headline} />
				{collections.length > 0 && (
					<div className={styles.collectionsGrid}>
						{collections.slice(0, 4).map((collection) => (
							<Collection key={collection.id} collection={collection} />
						))}
					</div>
				)}
			</div>
		</div>)
}