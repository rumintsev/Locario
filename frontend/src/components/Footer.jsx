// css
import Link from 'next/link';
import styles from './Footer.module.css';

//svg
import LogoIcon from '@/svg/logo.svg';

export default function Footer() {

	return (
		<footer className={styles.footer}>
			<div className={styles.footerContent}>

				<div className={styles.footerTop}>
					<div className={styles.logoWithDescription}>
						<div className={styles.logo}>
							<LogoIcon />
							<p>Locario</p>
						</div>

						<p>Ваш гид по интересным местами вдохновляющим путешествиям.</p>
					</div>

					<ul className={styles.footerNav}>
						<li>О проекте</li>
						<li><Link href={'/'}>О нас</Link></li>
						<li><Link href={'/'}>Контакты</Link></li>
						<li><Link href={'/'}>Помощь</Link></li>
					</ul>

				</div>

				<hr className={styles.hr} />

				<div className={styles.footerBottom}>
					<p>Copyright © 2026 Locario. Все права защищены</p>
					<Link href={'/'}>Политика конфиденциальности</Link>
				</div>

			</div>
		</footer >
	);
}