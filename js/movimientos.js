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

async function cargarHistorial(){
  const { data, error } = await supabaseClient
    .from("movimientos")
    .select("*")
    .order("fecha", { ascending: false })

  if(error){
    alert(error.message)
    return
  }

  let html = ""

  data.forEach(m => {
    html += `
      <div class="movimiento ${m.tipo}">
        ${m.fecha} | ${m.tipo} | ${(m.monto/100).toFixed(2)} | ${m.categoria || "-"} | ${m.descripcion || ""}
      </div>
    `
  })

  document.getElementById("historial").innerHTML = html
}




async function calcularBalanceMensual(){

  const hoy = new Date()
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    .toISOString().split("T")[0]

  const { data } = await supabaseClient
    .from("movimientos")
    .select("tipo, monto, fecha")
    .gte("fecha", inicioMes)

  let ingresos = 0
  let gastos = 0

  data.forEach(m => {
    if(m.tipo === "ingreso") ingresos += m.monto
    else gastos += m.monto
  })

  const balance = ingresos - gastos

  document.getElementById("balanceMensual").innerText =
    `Balance: ${(balance/100).toFixed(2)}`
}




async function guardarMovimiento(){

  const cuentaId = Number(document.getElementById("cuenta").value)
  const montoInput = Number(document.getElementById("monto").value)
  const categoria = document.getElementById("categoria").value
  const descripcion = document.getElementById("descripcion").value
  
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
      fecha,
      categoria,
      descripcion
    }])
  if(tipoActual === "gasto" && cuentaId.categoria === "ahorro"){
	alert("No puedes gastar desde una cuenta de ahorro")
	return
	}
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
