/* ./myFinanzas/js/app.js */
// ===== IMPORTS =====
import { cargarHistorial } from "./movimientos/historial.js"
import { calcularBalance } from "./movimientos/balance.js"
import { guardarMovimiento } from "./movimientos/form.js"
import { cargarMonedasPorCuenta, abrirModal, cerrarModal } from "./movimientos/modal.js"
import { state } from "./movimientos/state.js"
import { mostrarApp, mostrarLogin } from "./ui.js"

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  setEvents()
  initApp()
})

// ===== APP INIT =====
async function initApp(){
  const session = await checkSession()

  if(session){
    mostrarApp()
    await cargarCuentas()
  }else{
    mostrarLogin()
  }
}

// ===== EVENTS =====
function setEvents(){

  // AUTH
  document.getElementById("btnLogin")?.addEventListener("click", login)
  document.getElementById("btnLogout")?.addEventListener("click", logout)

  // NAV
  document.getElementById("btnDashboard")?.addEventListener("click", () => {
    mostrarVista("viewDashboard")
  })

  document.getElementById("btnHistorial")?.addEventListener("click", () => {
    mostrarVista("viewHistorial")
    state.paginaActual = 0
    cargarHistorial()
    calcularBalance()
  })

  // ===== DASHBOARD FILTROS =====
  document.getElementById("filtroTipoCuenta")?.addEventListener("change", cargarCuentas)
  document.getElementById("filtroCategoriaCuenta")?.addEventListener("change", cargarCuentas)
  document.getElementById("filtroMonedaCuenta")?.addEventListener("change", cargarCuentas)

  // ===== HISTORIAL FILTROS =====
  document.getElementById("filtroTiempo")?.addEventListener("change", (e) => {
  state.filtroTiempo = e.target.value
  state.paginaActual = 0

  const rango = document.getElementById("rangoCustom")

  if(state.filtroTiempo === "custom"){
    rango.style.display = "block"
  }else{
    rango.style.display = "none"
  }

  cargarHistorial()
  calcularBalance()
})

  document.getElementById("filtroTipo")?.addEventListener("change", (e) => {
    state.filtroTipo = e.target.value
    state.paginaActual = 0
    cargarHistorial()
    calcularBalance()
  })

  document.getElementById("filtroMonedaHistorial")?.addEventListener("change", () => {
    state.paginaActual = 0
    cargarHistorial()
    calcularBalance()
  })

  document.getElementById("fechaDesde")?.addEventListener("change", (e) => {
    state.fechaDesde = e.target.value
    state.paginaActual = 0
    cargarHistorial()
  })

  document.getElementById("fechaHasta")?.addEventListener("change", (e) => {
    state.fechaHasta = e.target.value
    state.paginaActual = 0
    cargarHistorial()
  })

  // ===== MOVIMIENTOS =====
  document.getElementById("btnIngreso")?.addEventListener("click", () => abrirModal("ingreso"))
  document.getElementById("btnGasto")?.addEventListener("click", () => abrirModal("gasto"))
  document.getElementById("cuenta")?.addEventListener("change", cargarMonedasPorCuenta)
  document.getElementById("btnGuardarMov")?.addEventListener("click", guardarMovimiento)
  document.getElementById("btnCerrarModal")?.addEventListener("click", cerrarModal)
}

// ===== UI =====
export function mostrarVista(vista){
  ["viewDashboard","viewHistorial"].forEach(v => {
    const el = document.getElementById(v)
    if(el) el.style.display = "none"
  })
  document.getElementById(vista).style.display = "block"
}
