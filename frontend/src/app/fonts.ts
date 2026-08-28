import localFont from 'next/font/local'

export const inter = localFont({
	src: '../../public/fonts/Inter-VariableFont.ttf',
	variable: '--inter',
	display: 'swap',
	weight: '400',
})

export const staatliches = localFont({
	src: '../../public/fonts/Staatliches-Regular.ttf',
	variable: '--staatliches',
	display: 'swap',
	weight: '400',
})

export const unbounded = localFont({
	src: '../../public/fonts/Unbounded-VariableFont_wght.ttf',
	variable: '--unbounded',
	display: 'swap',
	weight: '100 900',
})