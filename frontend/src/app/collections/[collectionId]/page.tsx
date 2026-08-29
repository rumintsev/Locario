import { z } from 'zod';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/serverFetch';
import Image from 'next/image';
import Collections from '@/components/CollectionsServer';
import BookmarkButton from '@/components/ui/BookmarkButton';

// css
import styles from './page.module.css'
import Tag from '@/components/ui/Tag';

//svg
import LogoIcon from '@/svg/logo.svg'
import Link from 'next/link';

const collectionIdSchema = z.coerce.number().int().positive();

const CollectionSchema = z.array(z.object({
	id: z.number(),
	name: z.string(),
	type: z.enum(['cities', 'places']),
	updateddate: z.string(), // 'YYYY-MM-DD'
	description: z.string(),
	tags: z.array(z.object({
		id: z.number(),
		name: z.string(),
		slug: z.string(),
		text_color: z.string(),
		bg_color: z.string(),
	})),
	items: z.array(z.object({
		id: z.number(),
		photo: z.string().nullable(),
		name: z.string(),
		description: z.string().nullable(),
		loc: z.string(),
	})),
}));

export default async function CollectionPage({
	params
}: {
	params: Promise<{ collectionId: string }>
}) {

	const { collectionId: rawId } = await params;
	const resultId = collectionIdSchema.safeParse(rawId);
	if (!resultId.success) {
		console.error(resultId.error);
		notFound();
	}

	const collectionId = resultId.data;

	const resultCollection = await serverFetch(`/collections/full/${collectionId}`, CollectionSchema);

	const hasError = !resultCollection.success;
	if (hasError) {
		console.error(resultCollection.error);
		notFound();
	}

	const collection = resultCollection.data[0];

	return (
		<>
			<div className={styles.collectionPage}>
				<div className={styles.collectionPageContent}>

					<BookmarkButton
						className={styles.bookmark}
						itemInfo={{ id: collection.id, type: 'collection' }}
					/>
					<h1>{collection.name}</h1>

					{collection.tags.length > 0 && (
						<div className={styles.tags}>
							{collection.tags.map((tag) => (
								<Tag tag={tag} key={tag.id} />
							))}
						</div>
					)}

					{collection.description && (
						<p>{collection.description}</p>
					)}

					<p className={styles.authorBar}>
						<span className={styles.authorBlock}><LogoIcon /> Locario</span> <span className={styles.dotSpan} /> <span className={styles.authorBlock}>Обновлено: {new Date(
							collection.updateddate).toLocaleDateString('ru-RU', {
								day: 'numeric',
								month: 'long',
								year: 'numeric',
							}).replace(' г.', '')} <span className={styles.dotSpan} /> {collection.items.length} карточек</span>
					</p>

					{collection.items.length > 0 && (
						<div className={styles.content}>

							{collection.items.map((item) => (
								<div className={styles.item} key={item.id}>

									<BookmarkButton
										className={styles.bookmark}
										itemInfo={{ id: item.id, type: collection.type === 'cities' ? 'city' : 'place' }}
									/>

									{item.photo ? (
										<div className={styles.photoBlock}>
											<Link
												href={`/${collection.type}/${item.id}`}
												className={styles.photo}>
												<Image
													src={`/img/${collection.type}/${item.photo}`}
													alt='Collection image'
													fill
													sizes="300px, 400px"
												/>
											</Link>

											<div className={styles.itemName}>
												<h2>{item.name}</h2>
												<h3>{item.loc}</h3>
											</div>
										</div>
									) : (
										<Link
											href={`/${collection.type}/${item.id}`}
											className={styles.photoDummy} />
									)}
									<div className={styles.itemDescription}>
										<div className={styles.itemName}>
											<h2>{item.name}</h2>
											<h3>{item.loc}</h3>
										</div>
										<p>{item.description}</p>
										<Link
											href={`/${collection.type}/${item.id}`}
											className={styles.link}
										>
											Смотреть целиком
										</Link>
									</div>
								</div>
							))}

						</div>
					)}

				</div>
			</div>

			<Collections
				headline='Может быть интересно'
				endpoint={`/collections/related/${collection.id}`}
				className={styles.collections}
			/>
		</>
	)
}