// css
import styles from './BookmarkButton.module.css'

// svg
import BookmarkIcon from '@/svg/smallBookmark.svg'

export default function BookmarkButton({ className }: { className: string }) {
	return (
		<button className={`${styles.button} ${className}`}>
			<BookmarkIcon />
		</button>
	)
}