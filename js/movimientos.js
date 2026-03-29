/* ./myFinanzas/js/movimientos.js */
let editandoId = null

async function crearMovimiento(){

const tipo = document.getElementById("tipoMovimiento").value
const cuentaId = Number(document.getElementById("cuentaMovimiento").value)
const monto = toCents(document.getElementById("montoMovimiento").value)
const categoria = document.getElementById("categoriaMovimiento").value
const descripcion = document.getElementById("descripcionMovimiento").value
const fecha = document.getElementById("fechaMovimiento").value

// 🔍 validar ahorro
const cuentaSeleccionada = cuentasGlobal.find(c => Number(c.id) === Number(cuentaId))

if(!cuentaSeleccionada){
alert("Error: cuenta no encontrada o no cargada")
return
}

if(tipo === "gasto" && cuentaSeleccionada.categoria === "ahorro"){
alert("No puedes gastar desde una cuenta de ahorros")
return
}

let error

// ✏️ UPDATE
if(editandoId){

({ error } = await supabaseClient
.from("movimientos")
.update({
tipo,
cuenta_id: cuentaId,
monto,
categoria,
descripcion,
fecha
})
.eq("id", editandoId))

editandoId = null

}else{

// ➕ INSERT
({ error } = await supabaseClient
.from("movimientos")
.insert([{
tipo,
cuenta_id: cuentaId,
monto,
categoria,
descripcion,
fecha,
user_id: userData.user.id
}]))

}

if(error){
alert(error.message)
return
}

// limpiar formulario
document.getElementById("montoMovimiento").value = ""
document.getElementById("categoriaMovimiento").value = ""
document.getElementById("descripcionMovimiento").value = ""
document.getElementById("fechaMovimiento").value = ""

}

async function cargarHistorial(){

const { data, error } = await supabaseClient
.from("movimientos")
.select("id, tipo, cuenta_id, monto, descripcion, fecha")
.order("fecha", { ascending: false })

if(error){
alert(error.message)
return
}

let html = ""

data.forEach(m => {

html += `
<div class="movimiento ${m.tipo}">
${m.fecha} | ${m.tipo} | ${fromCents(m.monto)} | ${m.descripcion}
<button onclick='editarMovimiento(${JSON.stringify(m)})'>✏️</button>
<button onclick="eliminarMovimiento(${m.id})">❌</button>
</div>
`

})

document.getElementById("listaHistorial").innerHTML = html

}



async function cargarMovimientos(){

	const { data, error } = await supabaseClient
	.from("movimientos")
	.select("id, tipo, cuenta_id, cuenta_destino, monto, fecha")
	.order("fecha", { ascending: false })

	if(error){
		alert(error.message)
		return
	}

	let html = ""

	data.forEach(m => {

		html += `
		<div class="movimiento ${m.tipo}">
		${m.fecha} | ${m.tipo} | ${fromCents(m.monto)} | ${m.descripcion}
		<button onclick='editarMovimiento(${JSON.stringify(m)})'>✏️</button>
		<button onclick="eliminarMovimiento(${m.id})">❌</button>
		</div>
		`

	})

	document.getElementById("listaMovimientos").innerHTML = html

}
function editarMovimiento(m){

editandoId = m.id

document.getElementById("tipoMovimiento").value = m.tipo
document.getElementById("cuentaMovimiento").value = m.cuenta_id
document.getElementById("montoMovimiento").value = m.monto
document.getElementById("categoriaMovimiento").value = m.categoria
document.getElementById("descripcionMovimiento").value = m.descripcion
document.getElementById("fechaMovimiento").value = m.fecha

}


async function eliminarMovimiento(id){
	const confirmar = confirm("¿ELIMINAR MOVIMIENTO? ESTO NO SE PUEDE DESHACER.")
	if(!confirmar) return
	const { error } = await supabaseClient
	.from("movimientos")
	.delete()
	.eq("id", id)
	
	if(error){
		alert(error.message)
		return
	}
	cargarCuentas()
}

//window.eliminarMovimiento = eliminarMovimiento
//function toggleDestino(){}
