import Link from "next/link"

// css
import styles from './Headline.module.css'

// svg
import ArrowIcon from '@/svg/next.svg'

export default function Headline({ headline, link }: { headline: string; link: string }) {
	return (
		<Link href={link} className={styles.headline}>
			<h2>{headline}</h2>
			<ArrowIcon />
		</Link>
	)
}