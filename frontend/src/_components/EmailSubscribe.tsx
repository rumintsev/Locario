// css
import styles from './EmailSubscribe.module.css'

// svg
import PathIcon from '@/svg/path.svg'

export default function EmailSubscribe() {
	return (
		<div className={styles.formBlock}>
			<div className={styles.formContent}>

				<div className={styles.headline}>
					<h2>Будьте в курсе новых мест и статей</h2>
					<div className={styles.icon}>
						<PathIcon />
					</div>
				</div>

				<form className={styles.form}>
					<div className={styles.inputBlock}>
						<input
							type="email"
							id="subscribe-email"
							name="email"
							placeholder="Ваш email"
							required
						/>
						<button type="submit">Подписаться</button>
					</div>

					<div className={styles.checkboxes}>
						<label>
							<input type="checkbox" name="new-collections" />
							<span>Новые подборки</span>
						</label>

						<label>
							<input type="checkbox" name="seasonal-articles" />
							<span>Сезонные статьи</span>
						</label>

						<label>
							<input type="checkbox" name="consent" required />
							<span>Согласен на обработку персональных данных</span>
						</label>
					</div>

				</form>

			</div>
		</div>
	)
}