// import Head from 'next/head';
import Link from 'next/link';
import styles from './page.module.css'

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

				<section>
					<Link href='/' className={styles.headline}>
						Категории
					</Link>
				</section>

			</div >
		</>
	);
}