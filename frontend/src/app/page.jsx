// import Head from 'next/head';
import Link from 'next/link';

// css
import styles from './page.module.css'

import Hero from '@/_components/Hero';
import Categories from '@/_components/Categories';
import Collections from '@/_components/Collections';
import Articles from '@/_components/Articles';
import Places from '@/_components/Places';
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
				<Collections />
				<Articles />
				<Places />
				<EmailSubscribe />
			</div >
		</>
	);
}