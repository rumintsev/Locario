import { z } from 'zod';

// css
import styles from './Cards.module.css';

// ui
import Headline from "@/components/ui/Headline";
import Error from "@/components/ui/Error";

import Card from "@/components/Card";
import { serverFetch } from "@/lib/serverFetch";

const CardsSchema = z.array(z.object({
	id: z.number(),
	name: z.string(),
	rate: z.number().nullable().optional(),
	updateddate: z.string(), // 'YYYY-MM-DD'
	photo: z.string().nullable(),
	tag: z.object({
		id: z.number(),
		name: z.string(),
		slug: z.string(),
		text_color: z.string(),
		bg_color: z.string(),
	}).nullable(),
}));

type Cards = z.infer<typeof CardsSchema>

export default async function Cards({
	headline,
	link,
	endpoint,
	className,
	type
}: {
	headline: string,
	link?: string,
	endpoint: string,
	className?: string,
	type: 'place' | 'city',
}) {

	const result = await serverFetch(endpoint, CardsSchema);

	const cards = result.success ? result.data : [];
	const hasError = !result.success;
	if (hasError) console.error(result.error)

	return (
		<div className={`${styles.cards} ${className}`}>
			<div className={styles.cardsContent}>
				<Headline headline={headline} link={link} />
				{cards.length > 0 ? (
					<div className={styles.cardsGrid}>
						{cards.map((card) => (
							<Card key={card.id} card={card} type={type} />
						))}
					</div>) : hasError ? (
						<Error text='Ошибка загрузки мест' />
					) : null}
			</div>
		</div>
	)
}