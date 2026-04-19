/* ./myFinanzas/js/cuentas.js: */
let cuentasGlobal = []

async function cargarCuentas(){

  const filtroTipo = document.getElementById("filtroTipoCuenta")?.value || "todos"
  const filtroCategoria = document.getElementById("filtroCategoriaCuenta")?.value || "todos"
  const filtroMoneda = document.getElementById("filtroMonedaCuenta")?.value || "todas"
  const monedaActual = document.getElementById("filtroMonedaCuenta").value

  const { data, error } = await supabaseClient
    .from("cuentas")
    .select(`
      id,
      nombre,
      tipo,
      categoria,
      saldos (
        moneda,
        saldo
      )
    `)

  if(error){
    console.error(error)
    return
  }

  if(!data || data.length === 0){
    document.getElementById("cuentas").innerHTML = `<div class="empty">No hay cuentas</div>`
    document.getElementById("total").innerHTML = "No hay datos"
    return
  }

  cuentasGlobal = data

  let html = ""
  let options = ""
  let totales = {}
  let monedasSet = new Set()

data.forEach(c => {
  if(c.saldos){
    c.saldos.forEach(s => {
      monedasSet.add(s.moneda)
    })
  }
})

  data.forEach(c => {

    if(filtroTipo !== "todos" && c.tipo !== filtroTipo) return
    if(filtroCategoria !== "todos" && c.categoria !== filtroCategoria) return

    // 🔥 IMPORTANTE: validar array real
    if(!c.saldos || c.saldos.length === 0) return

    // 🔥 FILTRAR SALDOS POR MONEDA
	let saldosFiltrados = c.saldos.filter(s => {
	if(filtroMoneda !== "todas" && s.moneda !== filtroMoneda) return false
	return true
	})

	// si no hay saldos después del filtro → no mostrar cuenta
	if(saldosFiltrados.length === 0) return

	// ===== TOTALES =====
	saldosFiltrados.forEach(s => {
	if(!totales[s.moneda]) totales[s.moneda] = 0
	totales[s.moneda] += s.saldo
	})

	// ===== RENDER =====
	if(saldosFiltrados.length === 1){

	const s = saldosFiltrados[0]

	html += `
    <div class="card cuenta ${c.categoria === "ahorro" ? "ahorro" : "normal"} ${c.tipo === "digital" ? "digital" : "efectivo"}">
      <span>${c.nombre}</span>
      <span>${c.tipo}</span>
      <span>${c.categoria}</span>
      <span>${s.moneda}</span>
      <span>${(s.saldo / 100).toFixed(2)}</span>
    </div>
  `

	}else{

html += `
<div class="card cuenta ${c.categoria === "ahorro" ? "ahorro" : "normal"} ${c.tipo === "digital" ? "digital" : "efectivo"}">

  <span class="nombreCuenta">${c.nombre}<span class="multiMark">*</span></span>
  <span>${c.tipo}</span>
  <span>${c.categoria}</span>

  <div class="monedaWrapper">
    <select class="selectorMoneda" data-id="${c.id}">
    
      ${saldosFiltrados.map(s => `
        <option value="${s.moneda}">
          ${s.moneda}
        </option>
      `).join("")}
    </select>
  </div>

  <span id="saldo-${c.id}">
    ${(saldosFiltrados[0].saldo / 100).toFixed(2)}
  </span>

</div>
`
}

    options += `<option value="${c.id}" data-categoria="${c.categoria}">${c.nombre}</option>`
  })

  // ===== SI NO HAY RESULTADOS FILTRADOS =====
  if(html === ""){
    html = `<div class="empty">No hay cuentas con ese filtro</div>`
  }

  // ===== TOTALES =====
  let totalHTML = ""

  Object.keys(totales).forEach(moneda => {
    const total = totales[moneda]

    let color = "#000"
    if(total > 0) color = "#00c853"
    else if(total < 0) color = "#ff5252"

    totalHTML += `
      <div style="color:${color}; font-weight:bold; text-shadow: 2px 2px 4px #000000;">
        ${moneda}: ${(total / 100).toFixed(2)}
      </div>
    `
  })

  document.getElementById("total").innerHTML = totalHTML || "0"
  document.getElementById("cuentas").innerHTML = html
  
  document.querySelectorAll(".selectorMoneda").forEach(select => {

  select.addEventListener("change", () => {

    const cuentaId = select.dataset.id
    const moneda = select.value

    const cuenta = cuentasGlobal.find(c => c.id == cuentaId)

    const saldo = cuenta.saldos.find(s => s.moneda === moneda)

    document.getElementById(`saldo-${cuentaId}`).innerText =
      (saldo.saldo / 100).toFixed(2)

  })

})
  document.getElementById("cuenta").innerHTML =
    `<option value="" disabled selected hidden>Seleccionar cuenta</option>${options}`

  // ===== FILTRO MONEDAS =====
  let opcionesMoneda = `<option value="todas">Todas las monedas</option>`

  monedasSet.forEach(m => {
    opcionesMoneda += `<option value="${m}" ${m === monedaActual ? "selected" : ""}>${m}</option>`
  })

  const filtroMonedaCuenta = document.getElementById("filtroMonedaCuenta")
  if(filtroMonedaCuenta){
    filtroMonedaCuenta.innerHTML = opcionesMoneda
  }

  const filtroHist = document.getElementById("filtroMonedaHistorial")
  if(filtroHist){
    filtroHist.innerHTML = opcionesMoneda
  }
}

