/* ./myFinanzas/js/movimientos/form.js */

import { limpiarFormularioMovimiento, obtenerFechaLocal } from "./utils.js";
import { state } from "./state.js";
import { cerrarModal } from "./modal.js";
import { cargarHistorial } from "./historial.js";
import { calcularBalance } from "./balance.js";

export async function guardarMovimiento(){

  const cuentaId = document.getElementById("cuenta").value
  const cuentaDestinoId = document.getElementById("cuentaDestino")?.value
  const moneda = document.getElementById("moneda").value
  const monto = parseFloat(document.getElementById("monto").value)
  const descripcion = document.getElementById("descripcion").value
  const fecha = document.getElementById("fecha").value

  if(!cuentaId || !moneda || !monto){
    alert("Faltan datos")
    return
  }

  const cuentaOrigen = cuentasGlobal.find(c => c.id == cuentaId)
  const cuentaDestino = cuentasGlobal.find(c => c.id == cuentaDestinoId)

  const montoFinal = Math.round(monto * 100)

  // =========================
  // 🔴 RESTRICCIONES
  // =========================

  // ❌ No permitir GASTOS en cuentas de ahorro
  if(state.tipoActual === "gasto" && cuentaOrigen?.categoria === "ahorro"){
    alert("No puedes realizar gastos desde una cuenta de ahorro")
    return
  }

  // ❌ No permitir TRANSFERENCIAS desde ahorro (solo como destino)
  if(state.esTransferencia && cuentaOrigen?.categoria === "ahorro"){
    alert("No puedes transferir dinero desde una cuenta de ahorro")
    return
  }

// =========================
// 🔥 TRANSFERENCIA (NUEVA LÓGICA)
// =========================
if(state.esTransferencia){

  if(!cuentaDestinoId){
    alert("Selecciona cuenta destino")
    return
  }

  if(cuentaId === cuentaDestinoId){
    alert("No puedes transferir a la misma cuenta")
    return
  }

  // 🔥 GUARDAR COMO UN SOLO MOVIMIENTO
  const { error } = await supabaseClient
    .from("movimientos")
    .insert({
      cuenta_id: cuentaId, // origen
      tipo: "transferencia",
      monto: montoFinal,
      moneda,
      categoria: "Transferencia",
      descripcion: cuentaDestinoId, // guardamos destino aquí
      fecha
    })

  if(error){
    console.error(error)
    alert("Error al guardar transferencia")
    return
  }

  // 🔻 restar origen
  await supabaseClient.rpc("restar_saldo", {
    id_cuenta: cuentaId,
    monto: montoFinal,
    moneda_param: moneda
  })

  // 🔺 sumar destino
  await supabaseClient.rpc("sumar_saldo", {
    id_cuenta: cuentaDestinoId,
    monto: montoFinal,
    moneda_param: moneda
  })
}else{

    // =========================
    // 🔥 INGRESO / GASTO NORMAL
    // =========================
    const { error } = await supabaseClient
      .from("movimientos")
      .insert({
        cuenta_id: cuentaId,
        tipo: state.tipoActual,
        monto: montoFinal,
        moneda,
        categoria: document.getElementById("categoria").value,
        descripcion,
        fecha
      })

    if(error){
      console.error(error)
      alert("Error al guardar movimiento")
      return
    }

    // 🔥 ACTUALIZAR SALDOS
    if(state.tipoActual === "ingreso"){
      await supabaseClient.rpc("sumar_saldo", {
        id_cuenta: cuentaId,
        monto: montoFinal,
        moneda_param: moneda
      })
    }else{
      await supabaseClient.rpc("restar_saldo", {
        id_cuenta: cuentaId,
        monto: montoFinal,
        moneda_param: moneda
      })
    }
  }

  // =========================
  // 🔄 REFRESH UI
  // =========================
  cerrarModal()

  await cargarCuentas()
  await cargarHistorial()
  await calcularBalance()
}



async function actualizarMovimiento(){

  const id = state.editandoId;

  const { data: original } = await supabaseClient
    .from("movimientos")
    .select("*")
    .eq("id", id)
    .single();

  // revertir saldo original
  const rpcRevert = original.tipo === "ingreso" ? "restar_saldo" : "sumar_saldo";

  await supabaseClient.rpc(rpcRevert, {
    id_cuenta: original.cuenta_id,
    monto: original.monto,
    moneda_param: original.moneda
  });

  // eliminar original
  await supabaseClient
    .from("movimientos")
    .delete()
    .eq("id", id);

  // guardar nuevo (usa la función actual)
  state.editandoId = null;
  await guardarMovimiento();
}
