/* ./myFinanzas/js/cuentas.js: */
async function cargarCuentas(){

  const { data } = await supabaseClient
  .from("cuentas")
  .select("id, nombre, saldo")
  .order("saldo", { ascending: false })

  let html = ""
  let total = 0
  let options = ""

  data.forEach(c => {
    total += c.saldo

    html += `
      <div class="card cuenta">
        <span>${c.nombre}</span>
        <span>${(c.saldo/100).toFixed(2)}</span>
      </div>
    `

    options += `<option value="${c.id}">${c.nombre}</option>`
  })

  document.getElementById("cuentas").innerHTML = html
  document.getElementById("total").innerText = (total/100).toFixed(2)
  document.getElementById("cuenta").innerHTML = options
}

