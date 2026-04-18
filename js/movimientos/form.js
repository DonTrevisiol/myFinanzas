/* ./myFinanzas/js/movimientos/form.js */

import { limpiarFormularioMovimiento, obtenerFechaLocal } from "./utils.js";
import { state } from "./state.js";
import { cerrarModal } from "./modal.js";
import { cargarHistorial } from "./historial.js";
import { calcularBalance } from "./balance.js";

export async function guardarMovimiento(){

  const cuentaSelect = document.getElementById("cuenta");
  const cuentaId = Number(cuentaSelect.value);
  const categoriaCuenta = cuentaSelect.options[cuentaSelect.selectedIndex]?.dataset.categoria;

  const montoInput = Number(document.getElementById("monto").value);
  const categoria = document.getElementById("categoria").value;
  const moneda = document.getElementById("moneda").value;
  const descripcion = document.getElementById("descripcion").value;

  // ===== VALIDACIONES =====
  if(!cuentaId){
    alert("Selecciona una cuenta");
    return;
  }

  if(!categoria){
    alert("Selecciona una categoría");
    return;
  }

  if(!moneda){
    alert("Selecciona una moneda");
    return;
  }

  if(!montoInput || montoInput <= 0){
    alert("Monto inválido");
    return;
  }

  if(state.tipoActual === "gasto" && categoriaCuenta === "ahorro"){
    alert("NO PUEDES GASTAR DESDE AHORRO");
    return;
  }

  const monto = Math.round(montoInput * 100);
  const fecha = document.getElementById("fecha").value || obtenerFechaLocal();

  // ===== INSERT =====
  const { error } = await supabaseClient
    .from("movimientos")
    .insert([{
      tipo: state.tipoActual,
      monto,
      cuenta_id: cuentaId,
      fecha,
      categoria,
      descripcion,
      moneda
    }]);

  if(error){
    alert(error.message);
    return;
  }

  // ===== ACTUALIZAR SALDO =====
  const rpc = state.tipoActual === "ingreso" ? "sumar_saldo" : "restar_saldo";

  const { error: errorRPC } = await supabaseClient.rpc(rpc, {
    id_cuenta: cuentaId,
    monto,
    moneda_param: moneda
  });

  if(errorRPC){
    alert(errorRPC.message);
    return;
  }

  // ===== UI =====
  limpiarFormularioMovimiento();
  cerrarModal();
  cargarCuentas();
  cargarHistorial();
  calcularBalance();
}
