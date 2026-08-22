// css
import styles from './Tag.module.css'

interface Tag {
	id: number;
	name: string;
	slug: string;
	text_color: string;
	bg_color: string;
}

export default function Tag({ tag, className }: { tag: Tag, className?: string }) {
	return (
		<div className={`${styles.tag} ${className}`} style={{
			color: tag.text_color,
			background: tag.bg_color
		}}>
			{tag.name.toLocaleUpperCase()}
		</div>
	)
}