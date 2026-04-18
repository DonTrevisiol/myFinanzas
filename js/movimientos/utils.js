/* ./myFinanzas/js/movimientos/utils.js */

/* =========================
   UTIL
========================= */

export function formatearFecha(fechaISO){
  const [año, mes, dia] = fechaISO.split("-")
  return `${dia}/${mes}/${año}`
}

export function obtenerFechaLocal(){
  const hoy = new Date()

  const año = hoy.getFullYear()
  const mes = String(hoy.getMonth() + 1).padStart(2, "0")
  const dia = String(hoy.getDate()).padStart(2, "0")

  return `${año}-${mes}-${dia}`
}

export function limpiarFormularioMovimiento(){
  document.getElementById("monto").value = ""
  document.getElementById("descripcion").value = ""
  document.getElementById("categoria").selectedIndex = 0
  document.getElementById("cuenta").selectedIndex = 0
}

