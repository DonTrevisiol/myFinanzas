/* ./myFinanzas/js/movimientos/modal.js */

import { catMov, state } from "./state.js";
import { obtenerFechaLocal } from "./utils.js";

/* =========================
   MODAL
========================= */
export function cargarCategorias(){
  const select = document.getElementById("categoria");
  select.innerHTML = "";

  catMov[state.tipoActual].forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
}

export function abrirModal(tipo){
  state.tipoActual = tipo;

  document.getElementById("cuenta").selectedIndex = 0;

  const modal = document.getElementById("modal");
  modal.style.display = "block";

  const monedaSelect = document.getElementById("moneda");
  monedaSelect.disabled = true;

  document.getElementById("modalTitle").innerText = tipo.toUpperCase();

  modal.classList.remove("modal-ingreso", "modal-gasto");
  modal.classList.add(tipo === "ingreso" ? "modal-ingreso" : "modal-gasto");

  const selectCuenta = document.getElementById("cuenta");

  Array.from(selectCuenta.options).forEach(opt => {
    const esAhorro = opt.dataset.categoria === "ahorro";
    opt.disabled = (tipo === "gasto" && esAhorro);
  });

  const inputFecha = document.getElementById("fecha");
  inputFecha.value = obtenerFechaLocal();

  document.getElementById("moneda").innerHTML =
    `<option value="" disabled selected hidden>Seleccionar moneda</option>`;

  cargarCategorias();
  cargarMonedasPorCuenta();
}

export function cerrarModal(){
  document.getElementById("modal").style.display = "none";
}

export function cargarMonedasPorCuenta(){

  const cuentaSelect = document.getElementById("cuenta");
  const monedaSelect = document.getElementById("moneda");

  const cuentaId = cuentaSelect.value;

  if(!cuentaId){
    monedaSelect.innerHTML = `<option value="" disabled selected hidden>Seleccionar moneda</option>`;
    monedaSelect.disabled = true;
    return;
  }

  monedaSelect.disabled = false;

  const cuenta = cuentasGlobal.find(c => c.id == cuentaId);
  if(!cuenta) return;

  let options = `<option value="" disabled selected hidden>Seleccionar moneda</option>`;

  if(state.tipoActual === "ingreso"){
    const monedasUnicas = new Set();

    cuentasGlobal.forEach(c => {
      if(c.saldos){
        c.saldos.forEach(s => monedasUnicas.add(s.moneda));
      }
    });

    monedasUnicas.forEach(m => {
      options += `<option value="${m}">${m}</option>`;
    });

  }else{
    if(!cuenta.saldos) return;

    cuenta.saldos.forEach(s => {
      options += `<option value="${s.moneda}">${s.moneda}</option>`;
    });
  }

  monedaSelect.innerHTML = options;
}
