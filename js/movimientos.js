/* ./myFinanzas/js/movimientos.js: */
let tipoActual = "ingreso"
let paginaActual = 0
const LIMITE = 10

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

  const desde = paginaActual * LIMITE
  const hasta = desde + LIMITE - 1

  const { data, error } = await supabaseClient
    .from("movimientos")
    .select("*")
    .order("fecha", { ascending: false })
    .range(desde, hasta)

  if(error){
    alert(error.message)
    return
  }

  let html = ""

  data.forEach(m => {
    html += `
      <div class="movimiento ${m.tipo}">
        ${m.fecha} | ${m.tipo} | ${m.monto/100} | ${m.categoria || "-"} | ${m.descripcion || ""}
      </div>
    `
  })

  document.getElementById("historial").innerHTML = html

  // 👇 CONTROL DE BOTONES
  const btnAnterior = document.getElementById("btnAnterior")
  const btnSiguiente = document.getElementById("btnSiguiente")

  // Botón anterior
  btnAnterior.style.display = paginaActual === 0 ? "none" : "inline-block"

  // Botón siguiente (CLAVE)
  if(data.length < LIMITE){
    btnSiguiente.style.display = "none"
  }else{
    btnSiguiente.style.display = "inline-block"
  }
}
function formatearFecha(fechaISO){
  const [año, mes, dia] = fechaISO.split("-")
  return `${dia}/${mes}/${año}`
}
async function cargarHistorial(){

  const desde = paginaActual * LIMITE
  const hasta = desde + LIMITE - 1

  const { data, error } = await supabaseClient
    .from("movimientos")
    .select(`
    id,
    tipo,
    monto,
    fecha,
    descripcion,
    cuentas(nombre)
    `)
    .order("fecha", { ascending: false })
    .range(desde, hasta)

  if(error){
    alert(error.message)
    return
  }

  // 🚫 CONTROL REAL DE LÍMITE
  if(data.length === 0 && paginaActual > 0){
    paginaActual--
    return cargarHistorial()
  }

  // detectar última página
  ultimaPagina = data.length < LIMITE

  let html = ""

  data.forEach(m => {

  const fecha = formatearFecha(m.fecha)
  const monto = (m.monto / 100).toFixed(2)
  const cuenta = m.cuentas?.nombre || "Sin cuenta"

  html += `
  <div class="movimiento ${m.tipo}">
    <span class="col fecha">${fecha}</span>
    <span class="col tipo">${m.tipo.toUpperCase()}</span>
    <span class="col monto">${monto}</span>
    <span class="col cuenta">${cuenta}</span>
    <span class="col descripcion">${m.descripcion || ""}</span>
  </div>
	`
	})

  document.getElementById("historial").innerHTML = html

  renderPaginacion()
}

function renderPaginacion(){

  let html = ""

  if(paginaActual > 0){
    html += `<button onclick="cambiarPagina(-1)">⬅️</button>`
  }

  html += `<span> Página ${paginaActual + 1} </span>`

  // 👇 SOLO SI NO ES ÚLTIMA PÁGINA
  if(!ultimaPagina){
    html += `<button onclick="cambiarPagina(1)">➡️</button>`
  }

  document.getElementById("paginacion").innerHTML = html
}

function cambiarPagina(direccion){
  paginaActual += direccion

  if(paginaActual < 0) paginaActual = 0

  cargarHistorial()
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
