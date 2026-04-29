/* ./myFinanzas/js/movimientos/state.js */
/* =========================
   CONFIG
========================= */
export const state = {
  tipoActual: "ingreso",
  esTransferencia: false,

  paginaActual: 0,
  LIMITE: 10,
  ultimaPagina: false,

  filtroTiempo: "hoy",
  fechaDesde: null,
  fechaHasta: null,
  filtroTipo: "todos",
  modoOrden: "fecha",
  ordenAscendente: false,
  
  editandoId: null
}

export const catMov = {
  ingreso: ["Salario", "Venta", "Regalo", "Suerte", "Otros"],
  gasto: ["Comida", "Transporte", "Ocio", "Servicios", "Higiene", "Otros"]
}

window.state = state
