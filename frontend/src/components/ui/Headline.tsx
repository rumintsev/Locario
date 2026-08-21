import Link from "next/link"

// svg
import ArrowIcon from '@/svg/next.svg'

export default function Headline({ headline, link }: { headline: string; link: string }) {
	return (
		<Link href={link} style={{
			display: 'flex',
			alignItems: 'center',
			gap: '4px',
			textDecoration: 'none',
			color: 'var(--text-color)',
			width: 'fit-content'
		}}>
			<h2 style={{
				fontSize: '30px',
				fontWeight: 600,
				fontFamily: 'Unbounded'
			}}>{headline}</h2>
			<ArrowIcon />
		</Link>
	)
}