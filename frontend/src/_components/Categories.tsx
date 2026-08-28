import Headline from "@/components/ui/Headline";
import Link from "next/link";

// css
import styles from './Categories.module.css'

// svg
import MuseumsIcon from '@/svg/museum.svg'
import FamilyIcon from '@/svg/family.svg'
import CupIcon from '@/svg/cup.svg'
import FlagIcon from '@/svg/flag.svg'
import LeafIcon from '@/svg/leaf.svg'
import WalletIcon from '@/svg/wallet.svg'

export default function Categories() {
	return (
		<div className={styles.categories}>
			<div className={styles.categoriesContent}>
				<Headline headline="Категории" link="/feed" />
				<div className={styles.categoriesBages}>
					<Link href="/feed?tags=museum">
						Музеи
						<MuseumsIcon />
					</Link>
					<Link href="/feed?tags=family">
						Семьёй
						<FamilyIcon />
					</Link>
					<Link href="/feed?tags=cafe">
						Кафе
						<CupIcon />
					</Link>
					<Link href="/feed?tags=activity">
						Активности
						<FlagIcon />
					</Link>
					<Link href="/feed?tags=nature">
						Природа
						<LeafIcon />
					</Link>
					<Link href="/feed?tags=free">
						Бесплатно
						<WalletIcon />
					</Link>
				</div>
			</div>
		</div>
	)
}