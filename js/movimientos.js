/* ./myFinanzas/js/movimientos.js */
/* =========================
   CONFIG
========================= */

const catMov = {
  ingreso: ["Salario", "Venta", "Regalo", "Suerte", "Otros"],
  gasto: ["Comida", "Transporte", "Ocio", "Servicios", "Higiene", "Otros"]
}

let tipoActual = "ingreso"

let paginaActual = 0
const LIMITE = 10
let ultimaPagina = false

// filtros
let filtroTiempo = "hoy" // hoy | semana | mes | anio | custom
let fechaDesde = null
let fechaHasta = null
let filtroTipo = "todos" // todos | ingreso | gasto | ahorro
let modoOrden = "fecha"


/* =========================
   CATEGORIAS
========================= */
function cargarCategorias(){
  const select = document.getElementById("categoria")
  select.innerHTML = ""

  catMov[tipoActual].forEach(cat => {
    const option = document.createElement("option")
    option.value = cat
    option.textContent = cat
    select.appendChild(option)
  })
}


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

  // bloquear ahorro solo en gastos
  const selectCuenta = document.getElementById("cuenta")

  Array.from(selectCuenta.options).forEach(opt => {
    const esAhorro = opt.dataset.categoria === "ahorro"
    opt.disabled = (tipo === "gasto" && esAhorro)
  })
  
  const inputFecha = document.getElementById("fecha")
  inputFecha.value = new Date().toISOString().split("T")[0]  
  
  cargarCategorias()
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

function limpiarFormularioMovimiento(){
  document.getElementById("monto").value = ""
  document.getElementById("descripcion").value = ""
  document.getElementById("categoria").selectedIndex = 0
  document.getElementById("cuenta").selectedIndex = 0
}


/* =========================
   FILTRO TIEMPO (UNIFICADO)
========================= */
function aplicarFiltroTiempo(query){

  const hoy = new Date()

  // normalizar a YYYY-MM-DD
  const hoyStr = hoy.toISOString().split("T")[0]

  if(filtroTiempo === "hoy"){
    return query.eq("fecha", hoyStr)
  }

  if(filtroTiempo === "semana"){
    const inicio = new Date(hoy)

    // 🔥 domingo = 0
    const dia = inicio.getDay()
    inicio.setDate(inicio.getDate() - dia)

    const inicioStr = inicio.toISOString().split("T")[0]

    return query.gte("fecha", inicioStr)
  }

  if(filtroTiempo === "mes"){
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    return query.gte("fecha", inicio.toISOString().split("T")[0])
  }

  if(filtroTiempo === "anio"){
    const inicio = new Date(hoy.getFullYear(), 0, 1)
    return query.gte("fecha", inicio.toISOString().split("T")[0])
  }

  if(filtroTiempo === "custom"){
    if(fechaDesde){
      query = query.gte("fecha", fechaDesde)
    }
    if(fechaHasta){
      query = query.lte("fecha", fechaHasta)
    }
    return query
  }

  return query
}


/* =========================
   HISTORIAL
========================= */
async function cargarHistorial(){

  const desde = paginaActual * LIMITE
  const hasta = desde + LIMITE

  let hayMas = false
  
  if(filtroTiempo === "recientes"){
	modoOrden = "created_at"
  }else{
	modoOrden = "fecha"
  }

  let query = supabaseClient
	.from("movimientos")
	.select(`
		id,
		tipo,
		monto,
		fecha,
		descripcion,
		cuentas!inner(nombre, categoria)
	`)

	if(modoOrden === "fecha"){
		query = query
		.order("fecha", { ascending: false })
		.order("id", { ascending: false })
	}else{
		query = query
		.order("created_at", { ascending: false })
		.order("id", { ascending: false })
	}
    

  // filtros
  query = aplicarFiltroTiempo(query)

  if(filtroTipo === "ingreso"){
    query = query.eq("tipo", "ingreso")
  }

  if(filtroTipo === "gasto"){
    query = query.eq("tipo", "gasto")
  }

  if(filtroTipo === "ahorro"){
    query = query.eq("tipo", "ingreso")
    query = query.eq("cuentas.categoria", "ahorro")
  }

  const { data, error } = await query.range(desde, hasta)

  if(error){
    alert(error.message)
    return
  }

  if(data.length === 0 && paginaActual > 0){
    paginaActual--
    return cargarHistorial()
  }

  if(data.length > LIMITE){
    hayMas = true
    data.pop()
  }else{
    hayMas = false
  }

  ultimaPagina = !hayMas

  let html = `
    <div class="header">
      <div class="col" id="colFecha">Fecha</div>
      <div class="col" id="colTipo">Tipo</div>
      <div class="col" id="colMonto">Monto</div>
      <div class="col" id="colCuenta">Cuenta</div>
      <div class="col" id="colDescripcion">Detalle</div>
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
   BALANCE / AHORROS
========================= */
async function calcularBalance(){

  let query = supabaseClient
    .from("movimientos")
    .select("tipo, monto, fecha, cuentas!inner(categoria)")

  query = aplicarFiltroTiempo(query)

  if(filtroTipo === "ingreso"){
    query = query.eq("tipo", "ingreso")
  }

  if(filtroTipo === "gasto"){
    query = query.eq("tipo", "gasto")
  }

  if(filtroTipo === "ahorro"){
    query = query.eq("tipo", "ingreso")
    query = query.eq("cuentas.categoria", "ahorro")
  }

  const { data, error } = await query

  if(error){
    console.error(error)
    return
  }

  let ingresos = 0
  let gastos = 0

  data.forEach(m => {
    if(m.tipo === "ingreso") ingresos += m.monto
    else gastos += m.monto
  })

  const balance = ingresos - gastos
  const el = document.getElementById('balanceMensual')

  if(filtroTipo === "ahorro"){
    el.innerText = `Ahorros: ${(ingresos / 100).toFixed(2)}`
  }else{
    el.innerText = `Balance: ${(balance / 100).toFixed(2)}`
  }

  el.style.color =
    balance > 0 ? "#00c853" :
    balance < 0 ? "#ff5252" :
    "#000000"
}


/* =========================
   GUARDAR
========================= */
async function guardarMovimiento(){

  const cuentaSelect = document.getElementById("cuenta")
  const cuentaId = Number(cuentaSelect.value)
  const categoriaCuenta = cuentaSelect.options[cuentaSelect.selectedIndex].dataset.categoria

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

  if(tipoActual === "gasto" && categoriaCuenta === "ahorro"){
    alert("NO PUEDES GASTAR DESDE AHORRO")
    return
  }

  const monto = Math.round(montoInput * 100)
  const inputFecha = document.getElementById("fecha").value
  const fecha = inputFecha || new Date().toISOString().split("T")[0]

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

  const rpc = tipoActual === "ingreso" ? "sumar_saldo" : "restar_saldo"

  const { error: errorRPC } = await supabaseClient.rpc(rpc, {
    id_cuenta: cuentaId,
    monto
  })

  if(errorRPC){
    alert(errorRPC.message)
    return
  }

  limpiarFormularioMovimiento()
  cerrarModal()
  cargarCuentas()
  cargarHistorial()
  calcularBalance()
}
