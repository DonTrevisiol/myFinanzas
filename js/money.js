/* ./myFinanzas/js/money.js */
// Convertir a centavos 
function toCents(money) {
	return Math.round(parseFloat(money) * 100)
}

// Convertir a formato visible
function fromCents(money) {
	return (money / 100).toFixed(2)
}
