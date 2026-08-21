// css
import styles from './Place.module.css'

interface Place {
	id: number;
	name: string;
	rate: number | null;
	updateddate: string; // 'YYYY-MM-DD'
	photo: string | null;
	tag: { id: number; name: string; slug: string } | null;
}

export default function Place({ place }: { place: Place }) {
	return (
		<div className={styles.place}>

		</div>
	)
}