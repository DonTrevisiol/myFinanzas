/*	./myFinanzas/app.js	*/
let totalVisible = true

function initApp(){
setEvents()
checkSession()
}

/* 👁 TOTAL */
function toggleTotal(){
const el = document.getElementById("totalGlobal")

if(totalVisible){
el.dataset.valor = el.innerText
el.innerText = "****"
}else{
el.innerText = el.dataset.valor || "0"
}

totalVisible = !totalVisible
}

/* 👁 PASSWORD */
function toggleVisibility(inputId, btn){
const input = document.getElementById(inputId)

if(input.type === "password"){
input.type = "text"
btn.innerText = "🙈"
}else{
input.type = "password"
btn.innerText = "👁️"
}
}

/* 🎯 EVENTOS */
function setEvents(){
document.getElementById("btnLogin").addEventListener("click", login)
document.getElementById("btnLogout").addEventListener("click", logout)
document.getElementById("btnCrearCuenta").addEventListener("click", crearCuenta)
document.getElementById("btnCrearMovimiento").addEventListener("click", crearMovimiento)
document.getElementById("btnVerHistorial").addEventListener("click", () => {
	mostrarVista("viewHistorial")
	cargarHistorial()
})
document.getElementById("btnVerDashboard").addEventListener("click", () => mostrarVista("viewDashboard"))

document.getElementById("btnVerMovimientos").addEventListener("click", () => {
mostrarVista("viewMovimientos")
cargarMovimientos()
})

document.getElementById("btnVerCuentas").addEventListener("click", () => {
mostrarVista("viewCuentas")
cargarCuentasGestion()
})

document.getElementById("btnToggleTotal").addEventListener("click", toggleTotal)
}

/* 🔄 VISTAS */
function mostrarVista(vista){
const vistas = ["viewDashboard", "viewCuentas", "viewMovimientos", "viewHistorial"]

vistas.forEach(v => {
document.getElementById(v).style.display = "none"
})

document.getElementById(vista).style.display = "block"
}
document.getElementById("btnVerDashboard").addEventListener("click", () => {
mostrarVista("viewDashboard")
cargarCuentas()
})

document.getElementById("btnVerMovimientos").addEventListener("click", () => {
mostrarVista("viewMovimientos")
cargarMovimientos()
})

document.getElementById("btnVerCuentas").addEventListener("click", () => {
mostrarVista("viewCuentas")
cargarCuentasGestion()
})

initApp()
