import { z } from 'zod';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/serverFetch';
import Image from 'next/image';
import Articles from '@/components/ArticlesServer';
import ConvertedText from '@/components/ConvertedText';

// css
import styles from './page.module.css'
import Tag from '@/components/ui/Tag';

//svg
import LogoIcon from '@/svg/logo.svg'
import BookmarkButton from '@/components/ui/BookmarkButton';

const articleIdSchema = z.coerce.number().int().positive();

const ArticleSchema = z.array(z.object({
	id: z.number(),
	name: z.string(),
	updateddate: z.string(), // 'YYYY-MM-DD'
	description: z.string(),
	text: z.string(),
	photo: z.array(z.string()),
	tags: z.array(z.object({
		id: z.number(),
		name: z.string(),
		slug: z.string(),
		text_color: z.string(),
		bg_color: z.string()
	}))
}));

export default async function ArticlePage({
	params
}: {
	params: Promise<{ articleId: string }>
}) {

	const { articleId: rawId } = await params;
	const resultId = articleIdSchema.safeParse(rawId);
	if (!resultId.success) {
		console.error(resultId.error);
		notFound();
	}

	const articleId = resultId.data;

	const resultArticle = await serverFetch(`/articles/full/${articleId}`, ArticleSchema);

	const hasError = !resultArticle.success;
	if (hasError) {
		console.error(resultArticle.error);
		notFound();
	}

	const article = resultArticle.data[0];

	return (
		<>
			<div className={styles.articlePage}>
				<div className={styles.articlePageContent}>

					<BookmarkButton
						className={styles.bookmark}
						itemInfo={{ id: article.id, type: 'article' }}
					/>
					<h1>{article.name}</h1>

					{article.tags.length > 0 && (
						<div className={styles.tags}>
							{article.tags.map((tag) => (
								<Tag tag={tag} key={tag.id} />
							))}
						</div>
					)}

					{article.description && (
						<p>{article.description}</p>
					)}

					<p className={styles.authorBar}>
						<LogoIcon /> Locario <span /> Обновлено: {new Date(
							article.updateddate).toLocaleDateString('ru-RU', {
								day: 'numeric',
								month: 'long',
								year: 'numeric',
							}).replace(' г.', '')}
					</p>

					<div className={styles.photo}>
						<Image
							src={`/img/articles/${article.photo[0]}`}
							alt='Article image'
							fill
							sizes="800px, 450px"
						/>
					</div>

					<ConvertedText text={article.text} />

				</div>
			</div>

			<Articles
				headline='Может быть интересно'
				endpoint={`/articles/related/${article.id}`}
				className={styles.articles}
			/>
		</>
	)
}