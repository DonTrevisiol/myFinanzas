/* ./myFinanzas/js/movimientos.js */

let tipoActual = "ingreso"
let paginaActual = 0
const LIMITE = 10
let filtroActual = "hoy"
let filtroTipo = "todos"
let ultimaPagina = false

/* =========================
   MODAL
========================= */
function abrirModal(tipo){
  tipoActual = tipo

  const modal = document.getElementById("modal")
  modal.style.display = "block"

  document.getElementById("modalTitle").innerText = tipo.toUpperCase()

  modal.classList.remove("modal-ingreso", "modal-gasto")
  modal.classList.add(tipo === "ingreso" ? "modal-ingreso" : "modal-gasto")
}

function cerrarModal(){
  document.getElementById("modal").style.display = "none"
}

/* =========================
   UTIL
========================= */
function formatearFecha(fechaISO){
  const [año, mes, dia] = fechaISO.split("-")
  return `${dia}/${mes}/${año}`
}

/* =========================
   HISTORIAL
========================= */
async function cargarHistorial(){

  const desde = paginaActual * LIMITE
  const hasta = desde + LIMITE - 1

  let query = supabaseClient
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

  // 📅 filtro HOY
  if(filtroActual === "hoy"){
    const hoy = new Date().toISOString().split("T")[0]
    query = query.eq("fecha", hoy)
  }

  // 💰 filtro tipo
  if(filtroTipo === "ingreso" || filtroTipo === "gasto"){
    query = query.eq("tipo", filtroTipo)
  }

  // 📄 paginación
  const { data, error } = await query.range(desde, hasta)

  if(error){
    alert(error.message)
    return
  }

  if(data.length === 0 && paginaActual > 0){
    paginaActual--
    return cargarHistorial()
  }

  ultimaPagina = data.length < LIMITE

  let html = ""

  // 👇 HEADER SIEMPRE
  html += `
    <div class="header">
      <div class="col fecha">Fecha</div>
      <div class="col tipo">Tipo</div>
      <div class="col monto">Monto</div>
      <div class="col cuenta">Cuenta</div>
      <div class="col descripcion">Detalle</div>
    </div>
  `

  if(data.length === 0){
    html += `<div class="empty">No hay movimientos</div>`
  }else{

    data.forEach(m => {

      const fecha = formatearFecha(m.fecha)
      const cuenta = m.cuentas?.nombre || "-"
      const monto = (m.monto / 100).toFixed(2)

      const esIngreso = m.tipo === "ingreso"
      const montoFinal = `${esIngreso ? "+" : "-"}${monto} BOB`

      html += `
        <div class="movimiento ${m.tipo}">
          <span class="col fecha">${fecha}</span>
          <span class="col tipo">${m.tipo.toUpperCase()}</span>
          <span class="col monto">${montoFinal}</span>
          <span class="col cuenta">${cuenta}</span>
          <span class="col descripcion">${m.descripcion || ""}</span>
        </div>
      `
    })
  }

  document.getElementById("historial").innerHTML = html

  renderPaginacion()
}

/* =========================
   PAGINACIÓN
========================= */
function renderPaginacion(){

  let html = ""

  if(paginaActual > 0){
    html += `<button onclick="cambiarPagina(-1)">⬅️</button>`
  }

  html += `<span> Página ${paginaActual + 1} </span>`

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

/* =========================
   BALANCE DINÁMICO
========================= */
async function calcularBalance(){

  let query = supabaseClient
    .from("movimientos")
    .select("tipo, monto, fecha")
  if(filtroTipo === "ingreso" || filtroTipo === "gasto"){
	  query = query.eq("tipo", filtroTipo);
  }
  if(filtroActual === "hoy"){
    const hoy = new Date().toISOString().split("T")[0]
    query = query.eq("fecha", hoy)
  }

  const { data } = await query

  let ingresos = 0
  let gastos = 0

  data.forEach(m => {
    if(m.tipo === "ingreso") ingresos += m.monto
    else gastos += m.monto
  })

  const balance = ingresos - gastos
  const balanceFormateado = (balance / 100).toFixed(2);
  const el = document.getElementById('balanceMensual');

  el.innerText = `Balance: ${balanceFormateado}`
  el.style.color = balance > 0 ? "#00c853" : balance < 0 ? "#ff5252" : "#000000"
}

/* =========================
   GUARDAR
========================= */
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
  const fecha = new Date().toISOString().split("T")[0]

  const { error } = await supabaseClient
    .from("movimientos")
    .insert([{
      tipo: tipoActual,
      monto,
      cuenta_id: cuentaId,
      fecha,
      categoria,
      descripcion
    }])

  if(error){
    alert(error.message)
    return
  }

  let errorRPC

  if(tipoActual === "ingreso"){
    ({ error: errorRPC } = await supabaseClient.rpc("sumar_saldo", { id_cuenta: cuentaId, monto }))
  }else{
    ({ error: errorRPC } = await supabaseClient.rpc("restar_saldo", { id_cuenta: cuentaId, monto }))
  }

  if(errorRPC){
    alert(errorRPC.message)
    return
  }

  cerrarModal()
  cargarCuentas()
}

