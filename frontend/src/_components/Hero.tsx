import Link from 'next/link'
import Image from 'next/image'

// css
import styles from './Hero.module.css'

// svg
import CompasIcon from '@/svg/compas.svg'

// img
import heroImg from '@/assets/heroImg.png';

export default function Hero() {
	return (
		<div className={styles.hero}>
			<div className={styles.heroContent}>

				<div className={styles.heroLeft}>

					<div>
						<div className={styles.headlineTop}>
							<h2>Ваш гид</h2>
							<CompasIcon />
						</div>
						<h2>по интересным местам</h2>
					</div>

					<p>Находите места по душе рядом с вами: атмосферные кафе,
						красивые маршруты и секретные уголки города</p>

					<div className={styles.tagsBlock}>
						<p>Популярно сейчас:</p>
						<div className={styles.tags}>
							<Link href='/tag/'>
								Природа
							</Link>
							<Link href='/tag/'>
								Здоровье
							</Link>
							<Link href='/tag/'>
								Петербург
							</Link>
							<Link href='/tag/'>
								Беларусь
							</Link>
						</div>
					</div>
					
				</div>

				<div className={styles.heroRight}>
					<Image src={heroImg} alt="Hero" />
				</div>
			</div>
		</div>
	)
}