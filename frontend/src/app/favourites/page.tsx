// css
import styles from './page.module.css'

import Content from './_components/Content'

export default function FavouritesPage() {
	return (
		<>
			<h1 className={styles.headline}>Избранное</h1>
			<Content />
		</>
	)
}