/* ./myFinanzas/js/cuentas.js */
let cuentasGlobal = [];
async function crearCuenta(){

	const nombre = document.getElementById("nombreCuenta").value
	const tipo = document.getElementById("tipoCuenta").value
	const saldo = document.getElementById("saldoInicial").value
	const categoria = document.getElementById("categoriaCuenta").value

	const { error } = await supabaseClient
	.from("cuentas")
	.insert([
	{
		nombre: nombre,
		tipo: tipo,
		categoria: categoria,
		saldo_inicial: saldo,
		user_id: userData.user.id
	}
	])

	if(error){
		alert(error.message)
	}

	cargarCuentas()
	cargarCuentasGestion()

}

async function cargarCuentas(){

const { data: cuentas } = await supabaseClient
.from("cuentas")
.select("id, nombre, categoria, saldo_inicial")

const { data: movimientos } = await supabaseClient
.from("movimientos")
.select("tipo, cuenta_id, cuenta_destino, monto")

cuentasGlobal = cuentas

let saldos = {}

// inicializar en centavos
cuentas.forEach(c => {
saldos[c.id] = Number(c.saldo_inicial)
})

// aplicar movimientos (ya en centavos)
movimientos.forEach(m => {

if(m.cuenta_id){
if(m.tipo === "ingreso") saldos[m.cuenta_id] += Number(m.monto)
if(m.tipo === "gasto") saldos[m.cuenta_id] -= Number(m.monto)
if(m.tipo === "transferencia") saldos[m.cuenta_id] -= Number(m.monto)
}

if(m.cuenta_destino){
saldos[m.cuenta_destino] += Number(m.monto)
}

})

let html = ""
let options = ""
let totalGlobal = 0

cuentas.forEach(c => {

const saldo = saldos[c.id] || 0
totalGlobal += saldo

options += `<option value="${c.id}">${c.nombre}</option>`

html += `
<div class="cuenta ${c.categoria || "normal"}">
<b>${c.nombre}</b>: ${fromCents(saldo)}
</div>
`

})

const totalEl = document.getElementById("totalGlobal")

if(totalVisible){
totalEl.innerText = fromCents(totalGlobal)
}else{
totalEl.dataset.valor = fromCents(totalGlobal)
}

document.getElementById("cuentaMovimiento").innerHTML = options
document.getElementById("listaCuentas").innerHTML = html

}



async function eliminarCuenta(id){
		const confirmar = confirm(`¿¡Eliminar cuenta!?\nESTO NO SE PUEDE DESHACER`)
		if(!confirmar) return
		
		const { error } = await supabaseClient.from("cuentas")
		.delete()
		.eq("id", id)
		
		if(error){
			alert(error.message)
			return
		}
		cargarCuentas()
		cargarCuentasGestion()
}

async function cargarCuentasGestion(){
	const { data: cuentas } = await supabaseClient
	.from("cuentas")
	.select("id, nombre, categoria, saldo_inicial")
	
	let html = ""
	
	cuentas.forEach(cuenta => {
		html += `
		<div>
		${cuenta.nombre}
		<button onclick="eliminarCuenta(${cuenta.id})">ELIMINAR</button>
		</div>
		`
	})
	document.getElementById("listaCuentasGestion").innerHTML = html
}
