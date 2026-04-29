/* ./myFinanzas/js/movimientos/modal.js */

import { catMov, state } from "./state.js";
import { obtenerFechaLocal } from "./utils.js";
import { cargarCuentas } from "../cuentas.js"

/* =========================
   MODAL
========================= */
export function cargarCategorias(){

  const select = document.getElementById("categoria")
  select.innerHTML = ""

  // 🔥 evitar error en transferencia
  if(state.tipoActual === "transferencia"){
    select.style.display = "none"
    return
  }

  select.style.display = "block"

  const categorias = catMov[state.tipoActual] || []

  categorias.forEach(cat => {
    const opt = document.createElement("option")
    opt.value = cat
    opt.textContent = cat
    select.appendChild(opt)
  })
}

export function abrirModal(tipo){
  state.tipoActual = tipo
  state.esTransferencia = (tipo === "transferencia") // 🔥

  document.getElementById("cuenta").selectedIndex = 0

  const modal = document.getElementById("modal")
  modal.style.display = "block"

  const monedaSelect = document.getElementById("moneda")
  monedaSelect.disabled = true

  document.getElementById("modalTitle").innerText = tipo.toUpperCase()

  modal.classList.remove("modal-ingreso", "modal-gasto")
  
  if(state.esTransferencia){
    document.getElementById("categoria").style.display = "none"
  }else{
    document.getElementById("categoria").style.display = "block"
  }

  if(tipo === "ingreso"){
    modal.classList.add("modal-ingreso")
  }else if(tipo === "gasto"){
    modal.classList.add("modal-gasto")
  }

  // 🔥 MOSTRAR / OCULTAR CUENTA DESTINO
  const cuentaDestino = document.getElementById("cuentaDestino")
  cuentaDestino.style.display = state.esTransferencia ? "block" : "none"

  const inputFecha = document.getElementById("fecha")
  inputFecha.value = obtenerFechaLocal()

  document.getElementById("moneda").innerHTML =
    `<option value="" disabled selected hidden>Seleccionar moneda</option>`

  cargarCategorias()
  cargarMonedasPorCuenta()
  cargarCuentas()
}

export function cerrarModal(){
  document.getElementById("modal").style.display = "none";
  cargarCuentas()
}

export function cargarMonedasPorCuenta(){

  const cuentaSelect = document.getElementById("cuenta")
  const monedaSelect = document.getElementById("moneda")

  const cuentaId = cuentaSelect.value

  if(!cuentaId){
    monedaSelect.innerHTML = `<option value="" disabled selected hidden>Seleccionar moneda</option>`
    monedaSelect.disabled = true
    return
  }

  const cuenta = cuentasGlobal.find(c => c.id == cuentaId)
  if(!cuenta) return

  let options = `<option value="" disabled selected hidden>Seleccionar moneda</option>`

  // 🔥 SI NO TIENE SALDOS
  if(!cuenta.saldos || cuenta.saldos.length === 0){

    const monedasUnicas = new Set()

    cuentasGlobal.forEach(c => {
      if(c.saldos){
        c.saldos.forEach(s => monedasUnicas.add(s.moneda))
      }
    })

    monedasUnicas.forEach(m => {
      options += `<option value="${m}">${m}</option>`
    })

  }else{

    cuenta.saldos.forEach(s => {
      options += `<option value="${s.moneda}">${s.moneda}</option>`
    })

  }

  monedaSelect.innerHTML = options

  // 🔥 ESTO ES LO QUE TE FALTA
  monedaSelect.disabled = false
}
