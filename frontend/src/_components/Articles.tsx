import { z } from 'zod';

// ui
import Headline from "@/components/ui/Headline";
import Error from "@/components/ui/Error";

import Article from "@/components/Article";
import { serverFetch } from "@/lib/serverFetch";

const ArticlesSchema = z.array(z.object({
	id: z.number(),
	name: z.string(),
	updateddate: z.string(), // 'YYYY-MM-DD'
	photo: z.string().nullable(),
	tag: z.object({
		id: z.number(),
		name: z.string(),
		slug: z.string()
	}).nullable()
}));

type Articles = z.infer<typeof ArticlesSchema>;

export default async function Articles() {

	const result = await serverFetch('/articles/short/1,2,3,4', ArticlesSchema);

	const articles = result.success ? result.data : [];
	const hasError = !result.success;
	if (hasError) console.error(result.error)

	return (
		<div style={{
			padding: '0 var(--side-padding)',
			display: 'flex',
			justifyContent: 'center',
		}}>
			<div style={{
				maxWidth: 'var(--page-width)',
				width: '100%'
			}}>
				<Headline headline="Полезное" link="/" />
				{articles.length > 0 ? (
					<div style={{
						display: 'grid',
						gridTemplateColumns: '1fr 1fr',
						gridAutoRows: '1fr 1fr'
					}}>
						{articles.map((article) => (
							<Article key={article.id} article={article} />
						))}
					</div>) : hasError ? (
						<Error text='Ошибка загрузки статей' />
					) : null}
			</div>
		</div>
	)
}