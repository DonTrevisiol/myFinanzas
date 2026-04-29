/* ./myFinanzas/js/cuentas.js: */

import { state } from "./movimientos/state.js"

let cuentasGlobal = []

export async function cargarCuentas(){

  const filtroTipo = document.getElementById("filtroTipoCuenta")?.value || "todos"
  const filtroCategoria = document.getElementById("filtroCategoriaCuenta")?.value || "todos"
  const filtroMoneda = document.getElementById("filtroMonedaCuenta")?.value || "todas"
  const monedaActual = document.getElementById("filtroMonedaCuenta").value || "todas"

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
    document.getElementById("cuentas").innerHTML = `<div class="empty">No hay cuentas</div>`
    document.getElementById("total").innerHTML = "No hay datos"
    return
  }

  window.cuentasGlobal = data
  cuentasGlobal = data

  let html = ""
  let optionsOrigen = ""
  let optionsDestino = ""
  let totales = {}
  let monedasSet = new Set()

  // ===== RECOLECTAR MONEDAS =====
  data.forEach(c => {
    if(c.saldos){
      c.saldos.forEach(s => monedasSet.add(s.moneda))
    }
  })

  data.forEach(c => {

    if(filtroTipo !== "todos" && c.tipo !== filtroTipo) return
    if(filtroCategoria !== "todos" && c.categoria !== filtroCategoria) return

    if(!c.saldos) c.saldos = []

    let saldosFiltrados = c.saldos.filter(s => {
      if(filtroMoneda !== "todas" && s.moneda !== filtroMoneda) return false
      return true
    })

    const esAhorro = c.categoria === "ahorro"

    // =========================
    // 🎯 SELECTS
    // =========================
    let disabledOrigen = ""

    if(state.tipoActual === "gasto" && esAhorro){
      disabledOrigen = "disabled"
    }

    if(state.tipoActual === "transferencia" && esAhorro){
      disabledOrigen = "disabled"
    }


    // =========================
    // 💰 DASHBOARD (RESTAURADO)
    // =========================

    if(filtroMoneda !== "todas" && saldosFiltrados.length === 0){
		return
	}
	
	optionsOrigen += `
      <option value="${c.id}" ${disabledOrigen}>
        ${c.nombre}
      </option>
    `

    // destino SIEMPRE permitido
    optionsDestino += `
      <option value="${c.id}">
        ${c.nombre}
      </option>
    `

    // ===== TOTALES =====
    saldosFiltrados.forEach(s => {
      if(!totales[s.moneda]) totales[s.moneda] = 0
      totales[s.moneda] += s.saldo
    })

    // ===== UNA SOLA MONEDA =====
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

      // 🔥 MULTIDIVISA RESTAURADO
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

  // ===== RENDER =====
  document.getElementById("cuentas").innerHTML = html

  document.getElementById("cuenta").innerHTML =
    `<option value="" disabled selected hidden>Seleccionar cuenta</option>${optionsOrigen}`

  const cuentaDestinoSelect = document.getElementById("cuentaDestino")
  if(cuentaDestinoSelect){
    cuentaDestinoSelect.innerHTML =
      `<option value="" disabled selected hidden>Cuenta destino</option>${optionsDestino}`
  }

  // ===== EVENTO MULTIDIVISA =====
  document.querySelectorAll(".selectorMoneda").forEach(select => {
    select.addEventListener("change", () => {

      const cuentaId = select.dataset.id
      const moneda = select.value

      const cuenta = cuentasGlobal.find(c => c.id == cuentaId)
      const saldo = cuenta.saldos.find(s => s.moneda === moneda)

      document.getElementById(`saldo-${cuentaId}`).innerText =
        (saldo.saldo / 100).toFixed(2)
    })
  })

  // ===== TOTALES (CON SOMBRA RESTAURADA) =====
  let totalHTML = ""

  Object.keys(totales).forEach(moneda => {
    const total = totales[moneda]

    let color = "#000"
    if(total > 0) color = "#00c853"
    else if(total < 0) color = "#ff5252"

    totalHTML += `
      <div style="color:${color}; font-weight:bold; text-shadow: 2px 2px 4px #000000;">
        ${moneda}: ${(total / 100).toFixed(2)}
      </div>
    `
  })

  document.getElementById("total").innerHTML = totalHTML || "0"

  // ===== FILTRO MONEDAS =====
  let opcionesMoneda = `<option value="todas">Todas las monedas</option>`

  monedasSet.forEach(m => {
    opcionesMoneda += `<option value="${m}" ${m === monedaActual ? "selected" : ""}>${m}</option>`
  })

  document.getElementById("filtroMonedaCuenta").innerHTML = opcionesMoneda
  document.getElementById("filtroMonedaHistorial").innerHTML = opcionesMoneda
}
