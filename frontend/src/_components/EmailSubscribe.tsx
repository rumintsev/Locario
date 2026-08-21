// css
import styles from './EmailSubscribe.module.css'

// svg
import PathIcon from '@/svg/path.svg'

export default function EmailSubscribe() {
	return (
		<div>
			<div>
				<h2>Будьте в курсе новых мест и статей</h2>
				<PathIcon />
			</div>

			<form>
				<div>
					<label>Ваш email</label>
					<input
						type="email"
						id="subscribe-email"
						name="email"
						placeholder="you@example.com"
						required
					/>
				</div>

				<div>
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

				<button type="submit">Подписаться</button>
			</form>

		</div>
	)
}