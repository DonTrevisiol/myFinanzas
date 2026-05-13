// ./js/cuentas/filtros.js

export function getFiltrosCuenta(){

  return {
    filtroTipo:
      document.getElementById("filtroTipoCuenta")?.value || "todos",

    filtroCategoria:
      document.getElementById("filtroCategoriaCuenta")?.value || "todos",

    filtroMoneda:
      document.getElementById("filtroMonedaCuenta")?.value || "todas",

    monedaActual:
      document.getElementById("filtroMonedaCuenta")?.value || "todas"
  }
}

export function filtrarCuenta(c, filtros){

  if(
    filtros.filtroTipo !== "todos" &&
    c.tipo !== filtros.filtroTipo
  ){
    return false
  }

  if(
    filtros.filtroCategoria !== "todos" &&
    c.categoria !== filtros.filtroCategoria
  ){
    return false
  }

  return true
}

