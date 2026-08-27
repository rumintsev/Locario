import { z } from 'zod';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/serverFetch';
import Image from 'next/image';
import Cards from '@/components/CardsServer';
import ConvertedText from '@/components/ConvertedText';

// css
import styles from './page.module.css'
import Tag from '@/components/ui/Tag';

//svg
import LogoIcon from '@/svg/logo.svg'
import BookmarkButton from '@/components/ui/BookmarkButton';

const placeIdSchema = z.coerce.number().int().positive();

const PlaceSchema = z.array(z.object({
	id: z.number(),
	name: z.string(),
	loc: z.string(),
	rate: z.number(),
	updateddate: z.string(), // 'YYYY-MM-DD'
	description: z.string(),
	article: z.string().nullable(),
	photo: z.array(z.string()),
	tags: z.array(z.object({
		id: z.number(),
		name: z.string(),
		slug: z.string(),
		text_color: z.string(),
		bg_color: z.string()
	}))
}));

export default async function PlacePage({
	params
}: {
	params: Promise<{ placeId: string }>
}) {

	const { placeId: rawId } = await params;
	const resultId = placeIdSchema.safeParse(rawId);
	if (!resultId.success) {
		console.error(resultId.error);
		notFound();
	}

	const placeId = resultId.data;

	const resultPlace = await serverFetch(`/places/full/${placeId}`, PlaceSchema);

	const hasError = !resultPlace.success;
	if (hasError) {
		console.error(resultPlace.error);
		notFound();
	}

	const place = resultPlace.data[0];

	return (
		<>
			<div className={styles.placePage}>
				<div className={styles.placePageContent}>

					<BookmarkButton className={styles.bookmark} />

					<div className={styles.nameBlock}>
						<h1>{place.name}</h1>
						<h2>{place.loc}</h2>
					</div>

					{place.tags.length > 0 && (
						<div className={styles.tags}>
							{place.tags.map((tag) => (
								<Tag tag={tag} key={tag.id} />
							))}
						</div>
					)}

					<p className={styles.authorBar}>
						<LogoIcon /> Locario <span /> Обновлено: {new Date(
							place.updateddate).toLocaleDateString('ru-RU', {
								day: 'numeric',
								month: 'long',
								year: 'numeric',
							}).replace(' г.', '')}
					</p>

					<div className={styles.descriptionBlock}>

						{place.description && (
							<p>{place.description}</p>
						)}
						{place.photo.length > 0 && (
							<div className={styles.photos}>
								{place.photo.map((photo, i) => (
									<div
										className={styles.photo}
										key={i}>
										<Image
											src={`/img/places/${photo}`}
											alt='Place image'
											fill
											sizes="190px"
										/>
									</div>
								))}
							</div>
						)}
					</div>

					{place.article && (
						<ConvertedText text={place.article} />
					)}

				</div>
			</div>

			<Cards
				headline='Может быть интересно'
				endpoint={`/places/related/${place.id}`}
				className={styles.places}
				type='place'
			/>
		</>
	)
}