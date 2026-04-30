// ./myFinanzas/js/movimientos/queryBuilder.js

/* =========================
   CONSULTAS
========================= */

import { getFiltrosHistorial, aplicarFiltroTiempo } from "./filtros.js"
import { state } from "./state.js"

export function buildQuery(query){

  const { tipo, moneda } = getFiltrosHistorial()

  // =========================
  // 📅 FILTRO TIEMPO
  // =========================
  if(state.filtroTiempo !== "recientes"){
    query = aplicarFiltroTiempo(query)
  }

  // =========================
  // 🎯 FILTRO TIPO (CORREGIDO)
  // =========================

  // 🟡 AHORRO (caso especial)
	if(tipo === "ahorro"){
	// traer ingresos y transferencias (sin filtrar categoría aquí)
	  query = query.in("tipo", ["ingreso", "transferencia"])
	}

  // 🔵 TRANSFERENCIA
  else if(tipo === "transferencia"){
    query = query.eq("tipo", "transferencia")
  }

  // 🟢 INGRESO
  else if(tipo === "ingreso"){
    query = query.eq("tipo", "ingreso")
  }

  // 🔴 GASTO
  else if(tipo === "gasto"){
    query = query.eq("tipo", "gasto")
  }

  // ⚪ TODOS → no filtra por tipo

  // =========================
  // 💱 MONEDA
  // =========================
  if(moneda !== "todas"){
    query = query.eq("moneda", moneda)
  }

  return query
}
