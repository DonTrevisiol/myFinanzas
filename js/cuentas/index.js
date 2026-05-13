// ./js/cuentas/index.js

import { state } from "../movimientos/state.js"

import {
  getFiltrosCuenta
} from "./filtros.js"

import {
  renderDashboardCuenta,
  renderSelects,
  renderTotales,
  renderFiltroMonedas
} from "./render.js"

import {
  bindSelectorMoneda
} from "./eventos.js"

import {cuentasGlobal, setCuentasGlobal } from "./state.js"

export async function cargarCuentas(){

  const filtros = getFiltrosCuenta()

  const { data, error } = await supabaseClient
    .from("cuentas")
    .select(`
      id,
      nombre,
      tipo,
      categoria,
      saldos (
        moneda,
        saldo
      )
    `)

  if(error){
    console.error(error)
    return
  }

  if(!data || data.length === 0){

    document.getElementById("cuentas").innerHTML =
      `<div class="empty">
        No hay cuentas
      </div>`

    document.getElementById("total").innerHTML =
      "No hay datos"

    return
  }

  setCuentasGlobal(data);

  const resultado = renderDashboardCuenta({
    cuentas: data,
    filtros,
    state
  })

  // ===== DASHBOARD =====
  document.getElementById("cuentas").innerHTML =
    resultado.html

  // ===== SELECTS =====
  renderSelects(resultado)

  // ===== TOTALES =====
  renderTotales(resultado.totales)

  // ===== FILTRO MONEDAS =====
  renderFiltroMonedas({
    monedasSet: resultado.monedasSet,
    monedaActual: filtros.monedaActual
  })

  // ===== EVENTOS =====
  bindSelectorMoneda(cuentasGlobal)
}
