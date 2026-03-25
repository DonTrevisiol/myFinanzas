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
		saldo_inicial: saldo
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
	.select("*")
	
	cuentasGlobal = cuentas

	const { data: movimientos } = await supabaseClient
	.from("movimientos")
	.select("*")

	let html = ""
	let options = ""
	let totalGlobal = 0
	const totalEl = document.getElementById("totalGlobal")

	cuentas.forEach(cuenta => {

		let saldo = Number(cuenta.saldo_inicial)

		options += `
		<option value="${cuenta.id}">
		${cuenta.nombre}
		</option>
		`

		movimientos.forEach(m => {

			if(m.cuenta_id === cuenta.id){

				if(m.tipo === "ingreso") saldo += Number(m.monto)
				if(m.tipo === "gasto") saldo -= Number(m.monto)
				if(m.tipo === "transferencia") saldo -= Number(m.monto)

			}

			if(m.cuenta_destino === cuenta.id){
				saldo += Number(m.monto)
			}

		})
		totalGlobal += saldo
		
		html += `
		<div class="cuenta ${cuenta.categoria || "normal"}">
		<b>${cuenta.nombre}</b>: ${saldo}
		</div>
		`

	})
	if(totalVisible){
		totalEl.innerText = totalGlobal
	}else{
		totalEl.dataset.valor = totalGlobal
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
	.select("*")
	
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
