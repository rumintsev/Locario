// css
import styles from './page.module.css'

// svg
import BookmarkIcon from '@/svg/bookmark.svg'

import Content from './_components/Content'

export default function FavouritesPage() {
	return (
		<>
			<div className={styles.headContainer}>
				<div className={styles.head}>

					<div className={styles.pageName}>
						<h1>Избранное</h1>
						<BookmarkIcon />
					</div>
					<p className={styles.description}>Удобные закладки, чтобы ничего не потерять</p>

				</div>
			</div>

			<Content />
		</>
	)
}