// import Head from 'next/head';
import Link from 'next/link';

// css
import styles from './page.module.css'

import Hero from '@/_components/Hero';
import Categories from '@/_components/Categories';
import Collections from '@/components/CollectionsServer';
import Articles from '@/components/ArticlesServer';
import Cards from '@/components/CardsServer';
import EmailSubscribe from '@/_components/EmailSubscribe';


// export const metadata = {
//   title: "Подборки интересных мест - Locario",
//   description: "Самые интересные места для отдыха: парки Петербурга и ближнее зарубежье",
//   keywords: "Санкт-Петербург, куда сходить, куда съездить, куда слетать, СНГ, ближнее зарубежье, маршруты, достопримечательности",
//   robots: "index, follow",
// };

export default async function MainPage() {

	return (
		<>
			{/* <Head>
        <meta name="yandex-verification" content="6460b2e6eeea2ab5" />
      </Head> */}
			<div className={styles.mainPage}>
				<Hero />
				<Categories />
				<Collections
					headline='Подборки'
					link='/feed?types=collection'
					endpoint='/collections/short/1,2,3,4'
				/>
				<Articles
					headline='Полезное'
					link='/feed?types=article'
					endpoint='/articles/short/1,2,3,4'
				/>
				<Cards
					headline='Хорошие места'
					link='/feed?types=place'
					endpoint='/places/short/1,2,3,4'
					type='place'
				/>
				<Cards
					headline='Интересные города'
					link='/feed?types=city'
					endpoint='/cities/short/17,18,19,20'
					type='city'
				/>
				<EmailSubscribe />
			</div >
		</>
	);
}