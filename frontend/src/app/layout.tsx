// import YandexMetrika from '@/components/YandexMetrika.jsx';
// import CookieNotice from '../components/CookieNotice.jsx';

import { inter, staatliches, unbounded } from './fonts'
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// export const metadata = {
//   title: "Locario",
//   description: "Самые интересные места для отдыха: парки Петербурга, ближнее зарубежье",
//   keywords: "Санкт-Петербург, куда сходить, куда съездить, куда слетать, СНГ, ближнее зарубежье, маршруты, достопримечательности",
//   robots: "index, follow",
// };

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="ru" className={`${inter.variable} ${staatliches.variable} ${unbounded.variable}`}>
			<body>
				{/* {process.env.IS_SERVER === "true" &&
          <YandexMetrika />} */}
				<Header />
				<main>
					{children}
				</main>
				{/* <CookieNotice /> */}
				<Footer />
			</body>
		</html >
	);
}
