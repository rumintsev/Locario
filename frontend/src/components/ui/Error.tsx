export default function Error({ text }: { text: string }) {
	return (
		<p style={{
			color: 'red',
			textAlign: 'center',
			background: 'rgba(255, 0, 0, 0.03)',
			maxWidth: '1000px',
			margin: '20px auto',
			padding: '10px',
			borderRadius: '10px'
		}}>{text}</p>
	)
}