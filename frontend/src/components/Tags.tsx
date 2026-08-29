// ui
import Headline from "@/components/ui/Headline";

// css
import styles from './Tags.module.css'

import TagComponent from "@/components/ui/Tag";
import { type Tag } from '@/schemas/schema'

export default function Tags({
	headline,
	className,
	tags,
}: {
	headline: string,
	className?: string,
	tags: Tag[],
}) {

	return (
		<div className={`${styles.tags} ${className}`}>
			<div className={styles.tagsContent}>
				<Headline headline={headline} />
				{tags.length > 0 && (
					<div className={styles.tagsGrid}>
						{tags.slice(0, 4).map((tag) => (
							<TagComponent key={tag.id} tag={tag} />
						))}
					</div>
				)}
			</div>
		</div>)
}