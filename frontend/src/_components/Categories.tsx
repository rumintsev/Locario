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
				<Headline headline="Категории" link="/" />
				<div className={styles.categoriesBages}>
					<Link href="/">
						Музеи
						<MuseumsIcon />
					</Link>
					<Link href="/">
						Семьёй
						<FamilyIcon />
					</Link>
					<Link href="/">
						Кафе
						<CupIcon />
					</Link>
					<Link href="/">
						Активности
						<FlagIcon />
					</Link>
					<Link href="/">
						Природа
						<LeafIcon />
					</Link>
					<Link href="/">
						Бесплатно
						<WalletIcon />
					</Link>
				</div>
			</div>
		</div>
	)
}