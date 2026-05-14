/* ./myFinanzas/js/gestion.js */

var cuentaEditandoId = null
var cuentasCache = []
var saldosAEliminar = []

// =========================
//   CARGAR LISTA
// =========================
async function cargarCuentasGestion() {
  const { data, error } = await supabaseClient
    .from("cuentas")
    .select(`id, nombre, tipo, categoria, saldos(moneda, saldo)`)

  if (error) {
    console.error(error)
    return
  }

  cuentasCache = data || []
  const container = document.getElementById("listaCuentasGestion")

  if (!cuentasCache.length) {
    container.innerHTML = `<div class="empty">No hay cuentas creadas</div>`
    return
  }

  let html = ""
  cuentasCache.forEach(c => {
    const saldosText = c.saldos?.map(s =>
      `${s.moneda}: ${(s.saldo / 100).toFixed(2)}`
    ).join(" · ") || "Sin saldo"

    html += `
      <div class="card gestion-cuenta ${c.categoria} ${c.tipo}">
        <div class="gestion-info">
          <strong class="gestion-nombre">${c.nombre}</strong>
          <span class="gestion-meta">${c.tipo} · ${c.categoria}</span>
          <span class="gestion-saldos">${saldosText}</span>
        </div>
        <div class="gestion-acciones">
          <button class="btn-editar" data-id="${c.id}">✏️ Editar</button>
          <button class="btn-eliminar" data-id="${c.id}">🗑️ Eliminar</button>
        </div>
      </div>
    `
  })

  container.innerHTML = html

  container.querySelectorAll(".btn-editar").forEach(btn => {
    btn.addEventListener("click", () => abrirModalCuenta("editar", btn.dataset.id))
  })

  container.querySelectorAll(".btn-eliminar").forEach(btn => {
    btn.addEventListener("click", () => confirmarEliminarCuenta(btn.dataset.id))
  })
}

// =========================
//   FILAS DE SALDO
// =========================
function crearFilaSaldoExistente(moneda, saldoCentavos) {
  const div = document.createElement("div")
  div.className = "saldo-row"
  div.dataset.moneda = moneda
  div.innerHTML = `
    <span class="saldo-moneda-label">${moneda}</span>
    <input type="number" class="saldo-monto-input" data-moneda="${moneda}"
      value="${(saldoCentavos / 100).toFixed(2)}" step="0.01">
    <button type="button" class="btn-quitar-saldo" title="Eliminar divisa">×</button>
  `
  div.querySelector(".btn-quitar-saldo").addEventListener("click", () => {
    saldosAEliminar.push(moneda)
    div.remove()
  })
  return div
}

function crearFilaSaldoNueva() {
  const div = document.createElement("div")
  div.className = "saldo-row nueva"
  div.innerHTML = `
    <input type="text" class="saldo-nueva-moneda" placeholder="USD" maxlength="5">
    <input type="number" class="saldo-nueva-monto" value="0" step="0.01">
    <button type="button" class="btn-quitar-saldo" title="Quitar">×</button>
  `
  div.querySelector(".btn-quitar-saldo").addEventListener("click", () => {
    div.remove()
  })
  return div
}

// =========================
//   ABRIR MODAL
// =========================
function abrirModalCuenta(modo, id) {
  cuentaEditandoId = id || null
  saldosAEliminar = []

  const modal = document.getElementById("modalCuenta")
  const titulo = document.getElementById("modalCuentaTitulo")
  const campoCrear = document.getElementById("campoSaldoInicial")
  const campoEditar = document.getElementById("campoSaldosEditar")
  const lista = document.getElementById("listaSaldosEditar")

  if (modo === "crear") {
    titulo.textContent = "Nueva Cuenta"
    document.getElementById("cuentaNombre").value = ""
    document.getElementById("cuentaTipo").value = "efectivo"
    document.getElementById("cuentaCategoria").value = "normal"
    document.getElementById("cuentaMoneda").value = ""
    document.getElementById("cuentaSaldoInicial").value = ""
    campoCrear.style.display = "block"
    campoEditar.style.display = "none"
  } else {
    titulo.textContent = "Editar Cuenta"
    const cuenta = cuentasCache.find(c => String(c.id) === String(id))

    if (cuenta) {
      document.getElementById("cuentaNombre").value = cuenta.nombre
      document.getElementById("cuentaTipo").value = cuenta.tipo
      document.getElementById("cuentaCategoria").value = cuenta.categoria

      lista.innerHTML = ""
      cuenta.saldos?.forEach(s => {
        lista.appendChild(crearFilaSaldoExistente(s.moneda, s.saldo))
      })
    }

    campoCrear.style.display = "none"
    campoEditar.style.display = "block"

    document.getElementById("btnAgregarDivisa").onclick = () => {
      lista.appendChild(crearFilaSaldoNueva())
    }
  }

  modal.style.display = "block"
}

// =========================
//   CERRAR MODAL
// =========================
function cerrarModalCuenta() {
  document.getElementById("modalCuenta").style.display = "none"
  cuentaEditandoId = null
  saldosAEliminar = []
}

// =========================
//   GUARDAR
// =========================
async function guardarCuenta() {
  const nombre = document.getElementById("cuentaNombre").value.trim()
  const tipo = document.getElementById("cuentaTipo").value
  const categoria = document.getElementById("cuentaCategoria").value

  if (!nombre) {
    alert("Ingresá un nombre para la cuenta")
    return
  }

  if (cuentaEditandoId) {

    // --- Actualizar datos de la cuenta ---
    const { error } = await supabaseClient
      .from("cuentas")
      .update({ nombre, tipo, categoria })
      .eq("id", cuentaEditandoId)

    if (error) {
      alert("Error al editar: " + error.message)
      return
    }

    // --- Eliminar divisas marcadas ---
    for (const moneda of saldosAEliminar) {
      await supabaseClient
        .from("saldos")
        .delete()
        .eq("cuenta_id", cuentaEditandoId)
        .eq("moneda", moneda)
    }

    // --- Actualizar saldos existentes ---
    const filasExistentes = document.querySelectorAll("#listaSaldosEditar .saldo-row:not(.nueva)")
    for (const fila of filasExistentes) {
      const moneda = fila.dataset.moneda
      const saldo = Math.round(parseFloat(fila.querySelector(".saldo-monto-input").value) * 100) || 0
      await supabaseClient
        .from("saldos")
        .update({ saldo })
        .eq("cuenta_id", cuentaEditandoId)
        .eq("moneda", moneda)
    }

    // --- Insertar nuevas divisas ---
    const filasNuevas = document.querySelectorAll("#listaSaldosEditar .saldo-row.nueva")
    for (const fila of filasNuevas) {
      const moneda = fila.querySelector(".saldo-nueva-moneda").value.trim().toUpperCase()
      const saldo = Math.round(parseFloat(fila.querySelector(".saldo-nueva-monto").value) * 100) || 0
      if (moneda) {
        await supabaseClient
          .from("saldos")
          .insert({ cuenta_id: cuentaEditandoId, moneda, saldo })
      }
    }

  } else {

    // --- Crear cuenta nueva ---
    const moneda = document.getElementById("cuentaMoneda").value.trim().toUpperCase()
    const saldoRaw = parseFloat(document.getElementById("cuentaSaldoInicial").value) || 0

    if (!moneda) {
      alert("Ingresá una moneda (ej: ARS, USD)")
      return
    }

    const { data: nuevaCuenta, error: errorCuenta } = await supabaseClient
      .from("cuentas")
      .insert({ nombre, tipo, categoria })
      .select()
      .single()

    if (errorCuenta) {
      alert("Error al crear la cuenta: " + errorCuenta.message)
      return
    }

    const { error: errorSaldo } = await supabaseClient
      .from("saldos")
      .insert({
        cuenta_id: nuevaCuenta.id,
        moneda,
        saldo: Math.round(saldoRaw * 100)
      })

    if (errorSaldo) {
      alert("Error al crear el saldo inicial: " + errorSaldo.message)
      return
    }
  }

  cerrarModalCuenta()
  await cargarCuentasGestion()
  if (typeof cargarCuentas === "function") await cargarCuentas()
}

// =========================
//   ELIMINAR CUENTA
// =========================
async function confirmarEliminarCuenta(id) {
  const cuenta = cuentasCache.find(c => String(c.id) === String(id))
  if (!confirm(`¿Eliminar la cuenta "${cuenta?.nombre}"?\nEsta acción no se puede deshacer.`)) return

  await supabaseClient.from("saldos").delete().eq("cuenta_id", id)

  const { error } = await supabaseClient.from("cuentas").delete().eq("id", id)

  if (error) {
    alert("No se pudo eliminar la cuenta. Es posible que tenga movimientos asociados.")
    return
  }

  await cargarCuentasGestion()
  if (typeof cargarCuentas === "function") await cargarCuentas()
}