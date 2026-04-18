// ./myFinanzas/js/movimientos/queryBuilder.js

/* =========================
   CONSULTAS
========================= */

import { getFiltrosHistorial, aplicarFiltroTiempo } from "./filtros.js"
import { state } from "./state.js"

export function buildQuery(query){

  const { tipo, moneda } = getFiltrosHistorial()

  // 🔴 IMPORTANTE: "recientes" NO filtra por fecha
  if(state.filtroTiempo !== "recientes"){
    query = aplicarFiltroTiempo(query)
  }

  if(tipo === "ingreso"){
    query = query.eq("tipo", "ingreso")
  }

  if(tipo === "gasto"){
    query = query.eq("tipo", "gasto")
  }

  if(tipo === "ahorro"){
    query = query.eq("tipo", "ingreso")
    query = query.eq("cuentas.categoria", "ahorro")
  }

  if(moneda !== "todas"){
    query = query.eq("moneda", moneda)
  }

  return query
}
