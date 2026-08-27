// css
import styles from './Cards.module.css';

// ui
import Headline from "@/components/ui/Headline";

import Card from "@/components/Card";
import { type Cards } from '@/schemas/schema';

export default function Cards({
	headline,
	className,
	type,
	cards,
}: {
	headline: string,
	className?: string,
	type: 'place' | 'city',
	cards: Cards,
}) {
	return (
		<div className={`${styles.cards} ${className}`}>
			<div className={styles.cardsContent}>
				<Headline headline={headline} />
				{cards.length > 0 && (
					<div className={styles.cardsGrid}>
						{cards.map((card) => (
							<Card key={card.id} card={card} type={type} />
						))}
					</div>
				)}
			</div>
		</div>
	)
}