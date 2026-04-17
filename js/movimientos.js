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
  
  //placeholder
  const placeholder = document.createElement("option")
  placeholder.value = ""
  placeholder.textContent = "Seleccionar categoria"
  placeholder.disabled = true
  placeholder.selected = true
  placeholder.hidden = true
  
  select.appendChild(placeholder)

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
  document.getElementById("cuenta").selectedIndex = 0
  const modal = document.getElementById("modal")
  modal.style.display = "block"
  const monedaSelect = document.getElementById("moneda")
  monedaSelect.disabled = true

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
  inputFecha.value = obtenerFechaLocal()
  document.getElementById("moneda").innerHTML = `<option value="" disabled selected hidden>Seleccionar moneda</option>`
  cargarCategorias()
  cargarMonedasPorCuenta()
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

function obtenerFechaLocal(){
  const hoy = new Date()

  const año = hoy.getFullYear()
  const mes = String(hoy.getMonth() + 1).padStart(2, "0")
  const dia = String(hoy.getDate()).padStart(2, "0")

  return `${año}-${mes}-${dia}`
}

/* =========================
   FILTRO TIEMPO (UNIFICADO)
========================= */

function getFiltrosHistorial(){
  return {
    tipo: filtroTipo,
    tiempo: filtroTiempo,
    moneda: document.getElementById("filtroMonedaHistorial")?.value || "todas"
  }
}

function aplicarFiltroTiempo(query){

  const hoyStr = obtenerFechaLocal()

  if(filtroTiempo === "hoy"){
    return query.eq("fecha", hoyStr)
  }

  if(filtroTiempo === "semana"){
    const hoy = new Date()

    const inicio = new Date(hoy)
    const dia = inicio.getDay() // domingo = 0
    inicio.setDate(inicio.getDate() - dia)

    const inicioStr = `${inicio.getFullYear()}-${String(inicio.getMonth() + 1).padStart(2, "0")}-${String(inicio.getDate()).padStart(2, "0")}`

    return query.gte("fecha", inicioStr)
  }

  if(filtroTiempo === "mes"){
    const hoy = new Date()
    const inicioStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-01`
    return query.gte("fecha", inicioStr)
  }

  if(filtroTiempo === "anio"){
    const hoy = new Date()
    const inicioStr = `${hoy.getFullYear()}-01-01`
    return query.gte("fecha", inicioStr)
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

  const { tipo, moneda } = getFiltrosHistorial()

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
      moneda,
      cuentas!inner(nombre, categoria, tipo)
    `)

  // ===== ORDEN =====
  if(modoOrden === "fecha"){
    query = query
      .order("fecha", { ascending: false })
      .order("id", { ascending: false })
  }else{
    query = query
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
  }

  // ===== FILTRO TIEMPO =====
  query = aplicarFiltroTiempo(query)

  // ===== FILTRO TIPO =====
  if(tipo === "ingreso"){
    query = query.eq("tipo", "ingreso")
  }

  if(tipo === "gasto"){
    query = query.eq("tipo", "gasto")
  }

  if(tipo === "ahorro"){
    query = query.eq("tipo", "ingreso")
    query = query.eq("cuentas.categoria", "ahorro")
  }

  // ===== FILTRO MONEDA =====
  if(moneda !== "todas"){
    query = query.eq("moneda", moneda)
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
      <div class="col">Fecha</div>
      <div class="col">Tipo</div>
      <div class="col">Monto</div>
      <div class="col">Cuenta</div>
      <div class="col">Detalle</div>
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
      const montoFinal = `${esIngreso ? "+" : "-"}${monto} ${m.moneda}`

      html += `
        <div class="movimiento ${m.tipo}">
          <span class="col">${fecha}</span>
          <span class="col">${m.tipo.toUpperCase()}</span>
          <span class="col">${montoFinal}</span>
          <span class="col">${cuenta}</span>
          <span class="col">${m.descripcion || ""}</span>
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

  const { tipo, moneda } = getFiltrosHistorial()

  let query = supabaseClient
    .from("movimientos")
    .select(`
      tipo,
      monto,
      moneda,
      cuentas!inner(categoria)
    `)

  // ===== FILTRO TIEMPO =====
  query = aplicarFiltroTiempo(query)

  // ===== FILTRO TIPO =====
  if(tipo === "ingreso"){
    query = query.eq("tipo", "ingreso")
  }

  if(tipo === "gasto"){
    query = query.eq("tipo", "gasto")
  }

  if(tipo === "ahorro"){
    query = query.eq("tipo", "ingreso")
    query = query.eq("cuentas.categoria", "ahorro")
  }

  // ===== FILTRO MONEDA =====
  if(moneda !== "todas"){
    query = query.eq("moneda", moneda)
  }

  const { data, error } = await query

  if(error){
    console.error(error)
    return
  }

  // ===== SIN DATOS =====
  if(!data || data.length === 0){
    document.getElementById("balanceMensual").innerHTML = `
      <div class="empty">Sin datos</div>
    `
    return
  }

  // ===== AGRUPAR =====
  let totales = {}

  data.forEach(m => {

    if(!totales[m.moneda]){
      totales[m.moneda] = { ingresos: 0, gastos: 0 }
    }

    if(m.tipo === "ingreso"){
      totales[m.moneda].ingresos += m.monto
    }else{
      totales[m.moneda].gastos += m.monto
    }
  })

  // ===== RENDER =====
  let html = ""

  Object.keys(totales).forEach(moneda => {

    const ingresos = totales[moneda].ingresos
    const gastos = totales[moneda].gastos
    const balance = ingresos - gastos

    let color = "#000"
    if(balance > 0) color = "#00c853"
    if(balance < 0) color = "#ff5252"

    if(tipo === "ahorro"){
      if(ingresos === 0) return

      html += `
        <div style="color:${color}; font-weight:bold">
          Ahorros: ${(ingresos/100).toFixed(2)} ${moneda}
        </div>
      `
    }else{
      html += `
        <div style="color:${color}; font-weight:bold">
          Balance: ${(balance/100).toFixed(2)} ${moneda}
        </div>
      `
    }
  })

  document.getElementById("balanceMensual").innerHTML = html
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
  const moneda = document.getElementById("moneda").value
  const descripcion = document.getElementById("descripcion").value


  if(!cuentaId){
    alert("Selecciona una cuenta")
    return
  }
  
  if(!categoria){
	alert("Seleccione una categoria")
	return
  }
  
  if(!moneda){
	alert("Seleccione una moneda")
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
  const fecha = inputFecha || obtenerFechaLocal()

  const { error } = await supabaseClient
    .from("movimientos")
    .insert([{
      tipo: tipoActual,
      monto,
      cuenta_id: cuentaId,
      fecha,
      categoria,
      descripcion,
      moneda
    }])

  if(error){
    alert(error.message)
    return
  }

  const rpc = tipoActual === "ingreso" ? "sumar_saldo" : "restar_saldo"

  const { error: errorRPC } = await supabaseClient.rpc(rpc, {
    id_cuenta: cuentaId,
    monto,
    moneda_param: moneda
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


function cargarMonedasPorCuenta(){

  const cuentaSelect = document.getElementById("cuenta")
  const monedaSelect = document.getElementById("moneda")

  const cuentaId = cuentaSelect.value

  // 🔴 si no hay cuenta → deshabilitar
  if(!cuentaId){
    monedaSelect.innerHTML = `<option value="" disabled selected hidden>Seleccionar moneda</option>`
    monedaSelect.disabled = true
    return
  }

  // 🟢 habilitar
  monedaSelect.disabled = false

  const cuenta = cuentasGlobal.find(c => c.id == cuentaId)
  if(!cuenta) return

  let options = `<option value="" disabled selected hidden>Seleccionar moneda</option>`

  // 🔥 CASO INGRESO vs GASTO
  if(tipoActual === "ingreso"){
    // 👇 TODAS LAS MONEDAS DISPONIBLES DEL SISTEMA
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
    // 👇 SOLO monedas de la cuenta (gasto)
    if(!cuenta.saldos) return

    cuenta.saldos.forEach(s => {
      options += `<option value="${s.moneda}">${s.moneda}</option>`
    })
  }

  monedaSelect.innerHTML = options
}
