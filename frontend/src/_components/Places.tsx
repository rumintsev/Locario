import { z } from 'zod';

// ui
import Headline from "@/components/ui/Headline";
import Error from "@/components/ui/Error";

import Place from "@/components/Place";
import { serverFetch } from "@/lib/serverFetch";

const PlacesSchema = z.array(z.object({
	id: z.number(),
	name: z.string(),
	rate: z.number().nullable(),
	updateddate: z.string(), // 'YYYY-MM-DD'
	photo: z.string().nullable(),
	tag: z.object({
		id: z.number(),
		name: z.string(),
		slug: z.string()
	}).nullable(),
}));

type Places = z.infer<typeof PlacesSchema>

export default async function Places() {

	const result = await serverFetch('/places/short/1,2,3,4', PlacesSchema);

	const places = result.success ? result.data : [];
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
				<Headline headline="Популярное на этой недели" link="/" />
				{places.length > 0 ? (
					<div style={{
						display: 'grid',
						gridTemplateColumns: '1fr 1fr',
						gridAutoRows: '1fr 1fr'
					}}>
						{places.map((place) => (
							<Place key={place.id} place={place} />
						))}
					</div>) : hasError ? (
						<Error text='Ошибка загрузки мест' />
					) : null}
			</div>
		</div>
	)
}