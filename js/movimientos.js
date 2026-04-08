/* ./myFinanzas/js/movimientos.js: */
let tipoActual = "ingreso"

/* MENÚ DE INGRESO DE DATOS DE MOVIMIENTOS: */
function abrirModal(tipo){
  tipoActual = tipo

  const modal = document.getElementById("modal")

  modal.style.display = "block"
  document.getElementById("modalTitle").innerText = tipo.toUpperCase()

  // 🎨 COLOR DINÁMICO
	modal.classList.remove("modal-ingreso", "modal-gasto")
	modal.classList.add(tipo === "ingreso" ? "modal-ingreso" : "modal-gasto")
}



function cerrarModal(){
  document.getElementById("modal").style.display = "none"
}

async function guardarMovimiento(){

  const cuentaId = Number(document.getElementById("cuenta").value)
  const montoInput = Number(document.getElementById("monto").value)

  if(!cuentaId){
    alert("Selecciona una cuenta")
    return
  }

  if(!montoInput || montoInput <= 0){
    alert("Monto inválido")
    return
  }

  const monto = Math.round(montoInput * 100)

  // ✅ FECHA CORRECTA
  const fecha = new Date().toISOString().split("T")[0]

  // ✅ INSERT COMPLETO
  const { error: errorInsert } = await supabaseClient
    .from("movimientos")
    .insert([{
      tipo: tipoActual,
      monto,
      cuenta_id: cuentaId,
      fecha: fecha
    }])

  if(errorInsert){
    alert(errorInsert.message)
    return
  }

  // ✅ ACTUALIZAR SALDO
  let errorRPC

  if(tipoActual === "ingreso"){
    ({ error: errorRPC } = await supabaseClient.rpc("sumar_saldo", {
      id_cuenta: cuentaId,
      monto
    }))
  }else{
    ({ error: errorRPC } = await supabaseClient.rpc("restar_saldo", {
      id_cuenta: cuentaId,
      monto
    }))
  }

  if(errorRPC){
    alert(errorRPC.message)
    return
  }

  cerrarModal()
  cargarCuentas()
}
