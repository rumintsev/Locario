// css
import styles from './ConvertedText.module.css';

export default function ConvertedText({ text }: { text: string }) {
	const renderWithBold = (text: string) => {
		const parts = text.split(/\*([^*]+)\*/g);
		return parts.map((part, i) =>
			i % 2 === 1 ? <b key={i}>{part}</b> : part
		);
	};

	return (
		<div className={styles.text}>
			{text
				.split('\n')
				.filter(item => item.trim() !== '')
				.map((item, index) => {
					if (item.startsWith('#')) {
						const headingText = item.replace(/^#+\s*/, '');
						return <h2 key={index}>{renderWithBold(headingText)}</h2>;
					} else if (/^\*\s/.test(item)) {
						return (
							<div className={styles.bulletItem} key={index}>
								<div className={styles.bullet} />
								<p>{renderWithBold(item.replace(/^\*\s*/, ''))}</p>
							</div>
						);
					} else {
						return <p key={index}>{renderWithBold(item)}</p>;
					}
				})}
		</div>)
}