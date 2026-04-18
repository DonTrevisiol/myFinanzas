/* ./myFinanzas/js/movimientos/filtros.js */
/* =========================
   FILTRO TIEMPO (UNIFICADO)
========================= */

import { state } from "./state.js"
import { obtenerFechaLocal } from "./utils.js"

export function getFiltrosHistorial(){
  return {
    tipo: state.filtroTipo,
    tiempo: state.filtroTiempo,
    moneda: document.getElementById("filtroMonedaHistorial")?.value || "todas"
  }
}

export function aplicarFiltroTiempo(query){

  const hoyStr = obtenerFechaLocal()

  if(state.filtroTiempo === "hoy"){
    return query.eq("fecha", hoyStr)
  }

  if(state.filtroTiempo === "semana"){
    const hoy = new Date()
    const inicio = new Date(hoy)
    const dia = inicio.getDay()
    inicio.setDate(inicio.getDate() - dia)

    const inicioStr = `${inicio.getFullYear()}-${String(inicio.getMonth()+1).padStart(2,"0")}-${String(inicio.getDate()).padStart(2,"0")}`

    return query.gte("fecha", inicioStr)
  }

  if(state.filtroTiempo === "mes"){
    const hoy = new Date()
    const inicioStr = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,"0")}-01`
    return query.gte("fecha", inicioStr)
  }

  if(state.filtroTiempo === "anio"){
    const hoy = new Date()
    return query.gte("fecha", `${hoy.getFullYear()}-01-01`)
  }

  if(state.filtroTiempo === "custom"){
    if(state.fechaDesde) query = query.gte("fecha", state.fechaDesde)
    if(state.fechaHasta) query = query.lte("fecha", state.fechaHasta)
    return query
  }

  return query
}
