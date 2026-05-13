// ./js/cuentas/render.js

export function renderDashboardCuenta({
  cuentas,
  filtros,
  state
}){

  let html = ""
  let optionsOrigen = ""
  let optionsDestino = ""
  let totales = {}
  let monedasSet = new Set()

  // ===== RECOLECTAR MONEDAS =====
  cuentas.forEach(c => {
    if(c.saldos){
      c.saldos.forEach(s => monedasSet.add(s.moneda))
    }
  })

  cuentas.forEach(c => {

    if(
      filtros.filtroTipo !== "todos" &&
      c.tipo !== filtros.filtroTipo
    ){
      return
    }

    if(
      filtros.filtroCategoria !== "todos" &&
      c.categoria !== filtros.filtroCategoria
    ){
      return
    }

    if(!c.saldos) c.saldos = []

    let saldosFiltrados = c.saldos.filter(s => {

      if(
        filtros.filtroMoneda !== "todas" &&
        s.moneda !== filtros.filtroMoneda
      ){
        return false
      }

      return true
    })

    const esAhorro = c.categoria === "ahorro"

    let disabledOrigen = ""

    if(state.tipoActual === "gasto" && esAhorro){
      disabledOrigen = "disabled"
    }

    if(state.tipoActual === "transferencia" && esAhorro){
      disabledOrigen = "disabled"
    }

    // 🔥 NO MOSTRAR CUENTAS VACÍAS
    if(
      filtros.filtroMoneda !== "todas" &&
      saldosFiltrados.length === 0
    ){
      return
    }

    // ===== SELECTS =====
    optionsOrigen += `
      <option value="${c.id}" ${disabledOrigen}>
        ${c.nombre}
      </option>
    `

    optionsDestino += `
      <option value="${c.id}">
        ${c.nombre}
      </option>
    `

    // ===== TOTALES =====
    saldosFiltrados.forEach(s => {

      if(!totales[s.moneda]){
        totales[s.moneda] = 0
      }

      totales[s.moneda] += s.saldo
    })

    // ===== UNA MONEDA =====
    if(saldosFiltrados.length === 1){

      const s = saldosFiltrados[0]

      html += `
      <div class="card cuenta ${c.categoria === "ahorro" ? "ahorro" : "normal"} ${c.tipo === "digital" ? "digital" : "efectivo"}">

        <span>${c.nombre}</span>
        <span>${c.tipo}</span>
        <span>${c.categoria}</span>
        <span>${s.moneda}</span>
        <span>${(s.saldo / 100).toFixed(2)}</span>

      </div>
      `

    }else{

      // ===== MULTIDIVISA =====
      html += `
      <div class="card cuenta ${c.categoria === "ahorro" ? "ahorro" : "normal"} ${c.tipo === "digital" ? "digital" : "efectivo"}">

        <span>${c.nombre}</span>
        <span>${c.tipo}</span>
        <span>${c.categoria}</span>

        <span class="col-divisa">
          <span class="icono-moneda">💱</span>

          <select class="selectorMoneda" data-id="${c.id}">
            ${saldosFiltrados.map(s => `
              <option value="${s.moneda}">
                ${s.moneda}
              </option>
            `).join("")}
          </select>
        </span>

        <span id="saldo-${c.id}">
          ${(saldosFiltrados[0].saldo / 100).toFixed(2)}
        </span>

      </div>
      `
    }
  })

  return {
    html,
    optionsOrigen,
    optionsDestino,
    totales,
    monedasSet
  }
}

export function renderSelects({
  optionsOrigen,
  optionsDestino
}){

  document.getElementById("cuenta").innerHTML =
    `<option value="" disabled selected hidden>
      Seleccionar cuenta
    </option>
    ${optionsOrigen}`

  const cuentaDestinoSelect =
    document.getElementById("cuentaDestino")

  if(cuentaDestinoSelect){

    cuentaDestinoSelect.innerHTML =
      `<option value="" disabled selected hidden>
        Cuenta destino
      </option>
      ${optionsDestino}`
  }
}

export function renderTotales(totales){

  let totalHTML = ""

  Object.keys(totales).forEach(moneda => {

    const total = totales[moneda]

    let color = "#000"

    if(total > 0){
      color = "#00c853"
    }else if(total < 0){
      color = "#ff5252"
    }

    totalHTML += `
      <div
        style="
          color:${color};
          font-weight:bold;
          text-shadow: 2px 2px 4px #000000;
        "
      >
        ${moneda}: ${(total / 100).toFixed(2)}
      </div>
    `
  })

  document.getElementById("total").innerHTML =
    totalHTML || "0"
}

export function renderFiltroMonedas({
  monedasSet,
  monedaActual
}){

  let opcionesMoneda =
    `<option value="todas">
      Todas las monedas
    </option>`

  monedasSet.forEach(m => {

    opcionesMoneda += `
      <option
        value="${m}"
        ${m === monedaActual ? "selected" : ""}
      >
        ${m}
      </option>
    `
  })

  document.getElementById(
    "filtroMonedaCuenta"
  ).innerHTML = opcionesMoneda

  document.getElementById(
    "filtroMonedaHistorial"
  ).innerHTML = opcionesMoneda
}
