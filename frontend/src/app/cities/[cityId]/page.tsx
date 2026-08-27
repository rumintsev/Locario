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

const cityIdSchema = z.coerce.number().int().positive();

const CitySchema = z.array(z.object({
	id: z.number(),
	name: z.string(),
	loc: z.string(),
	updateddate: z.string(), // 'YYYY-MM-DD'
	description: z.string().nullable(),
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

export default async function CityPage({
	params
}: {
	params: Promise<{ cityId: string }>
}) {

	const { cityId: rawId } = await params;
	const resultId = cityIdSchema.safeParse(rawId);
	if (!resultId.success) {
		console.error(resultId.error);
		notFound();
	}

	const cityId = resultId.data;

	const resultCity = await serverFetch(`/cities/full/${cityId}`, CitySchema);

	const hasError = !resultCity.success;
	if (hasError) {
		console.error(resultCity.error);
		notFound();
	}

	const city = resultCity.data[0];

	return (
		<>
			<div className={styles.cityPage}>
				<div className={styles.cityPageContent}>

					<BookmarkButton className={styles.bookmark} />

					<div className={styles.nameBlock}>
						<h1>{city.name}</h1>
						<h2>{city.loc}</h2>
					</div>

					{city.tags.length > 0 && (
						<div className={styles.tags}>
							{city.tags.map((tag) => (
								<Tag tag={tag} key={tag.id} />
							))}
						</div>
					)}

					<p className={styles.authorBar}>
						<LogoIcon /> Locario <span /> Обновлено: {new Date(
							city.updateddate).toLocaleDateString('ru-RU', {
								day: 'numeric',
								month: 'long',
								year: 'numeric',
							}).replace(' г.', '')}
					</p>

					<div className={styles.descriptionBlock}>

						{city.description && (
							<p>{city.description}</p>
						)}
						{city.photo.length > 0 && (
							<div className={styles.photos}>
								{city.photo.map((photo, i) => (
									<div
										className={styles.photo}
										key={i}>
										<Image
											src={`/img/cities/${photo}`}
											alt='City image'
											fill
											sizes="190px"
										/>
									</div>
								))}
							</div>
						)}
					</div>

					{city.article && (
						<ConvertedText text={city.article} />
					)}

				</div>
			</div>

			<Cards
				headline='Может быть интересно'
				endpoint={`/cities/related/${city.id}`}
				className={styles.cities}
				type='city'
			/>
		</>
	)
}