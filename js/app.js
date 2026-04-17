/* ./myFinanzas/js/app.js */
document.addEventListener("DOMContentLoaded", () => {
  setEvents()
  initApp()
})

async function initApp(){
  const session = await checkSession()

  if(session){
    mostrarApp()
    await cargarCuentas()
  }else{
    mostrarLogin()
  }
}

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
    paginaActual = 0
    cargarHistorial()
    calcularBalance()
  })

  // ===== DASHBOARD FILTROS =====
  document.getElementById("filtroTipoCuenta")?.addEventListener("change", cargarCuentas)
  document.getElementById("filtroCategoriaCuenta")?.addEventListener("change", cargarCuentas)
  document.getElementById("filtroMonedaCuenta")?.addEventListener("change", cargarCuentas)

  // ===== HISTORIAL FILTROS =====
  document.getElementById("filtroTiempo")?.addEventListener("change", (e) => {
    filtroTiempo = e.target.value
    paginaActual = 0
    cargarHistorial()
    calcularBalance()
  })

  document.getElementById("filtroTipo")?.addEventListener("change", (e) => {
    filtroTipo = e.target.value
    paginaActual = 0
    cargarHistorial()
    calcularBalance()
  })

  document.getElementById("filtroMonedaHistorial")?.addEventListener("change", () => {
    paginaActual = 0
    cargarHistorial()
    calcularBalance()
  })

  document.getElementById("fechaDesde")?.addEventListener("change", (e) => {
    fechaDesde = e.target.value
    paginaActual = 0
    cargarHistorial()
  })

  document.getElementById("fechaHasta")?.addEventListener("change", (e) => {
    fechaHasta = e.target.value
    paginaActual = 0
    cargarHistorial()
  })

  // MOVIMIENTOS
  document.getElementById("btnIngreso")?.addEventListener("click", () => abrirModal("ingreso"))
  document.getElementById("btnGasto")?.addEventListener("click", () => abrirModal("gasto"))
  document.getElementById("cuenta")?.addEventListener("change", cargarMonedasPorCuenta)
  document.getElementById("btnGuardarMov")?.addEventListener("click", guardarMovimiento)
}

function mostrarVista(vista){
  ["viewDashboard","viewHistorial"].forEach(v => {
    const el = document.getElementById(v)
    if(el) el.style.display = "none"
  })
  document.getElementById(vista).style.display = "block"
}
