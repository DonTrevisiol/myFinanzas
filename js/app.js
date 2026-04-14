/* ./myFinanzas/js/app.js */

document.addEventListener("DOMContentLoaded", () => {
  setEvents()
  initApp()
})

/* =========================
   INIT
========================= */
async function initApp(){
  const session = await checkSession()

  if(session){
    mostrarApp()
    cargarCuentas()
  }else{
    mostrarLogin()
  }
}

/* =========================
   EVENTOS
========================= */
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

  // FILTROS (NUEVOS SELECTS)

  document.getElementById("filtroTiempo")?.addEventListener("change", (e) => {
    filtroTiempo = e.target.value
    paginaActual = 0

    const custom = document.getElementById("rangoCustom")
    if(custom){
      custom.style.display = filtroTiempo === "custom" ? "block" : "none"
    }

    cargarHistorial()
    calcularBalance()
  })

  document.getElementById("filtroTipo")?.addEventListener("change", (e) => {
    filtroTipo = e.target.value
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

  document.getElementById("btnGuardarMov")?.addEventListener("click", guardarMovimiento)
}

/* =========================
   VISTAS
========================= */
function mostrarVista(vista){
  const vistas = ["viewDashboard", "viewHistorial"]

  vistas.forEach(v => {
    const el = document.getElementById(v)
    if(el) el.style.display = "none"
  })

  const activa = document.getElementById(vista)
  if(activa) activa.style.display = "block"
}
