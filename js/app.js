/*	./myFinanzas/js/app.js:	*/
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

  document.getElementById("btnLogin").addEventListener("click", login)
  document.getElementById("btnLogout").addEventListener("click", logout)

  document.getElementById("btnDashboard").addEventListener("click", () => {
    mostrarVista("viewDashboard")
  })

  document.getElementById("btnHistorial").addEventListener("click", () => {
    mostrarVista("viewHistorial")
    cargarHistorial()
    calcularBalanceMensual()
  })
  
  document.getElementById("btnIngreso").addEventListener("click", () => abrirModal("ingreso"))
  document.getElementById("btnGasto").addEventListener("click", () => abrirModal("gasto"))

  document.getElementById("btnGuardarMov").addEventListener("click", guardarMovimiento)
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

  document.getElementById(vista).style.display = "block"
}
