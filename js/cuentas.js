/* ./myFinanzas/js/cuentas.js: */
async function cargarCuentas(){

  const { data } = await supabaseClient
  .from("cuentas")
  .select("id, nombre, saldo, tipo, categoria")
  .order("saldo", { ascending: false })
  
  let html = ""
  let total = 0
  let options = ""
  data.forEach(c => {
    total += c.saldo
	
    html += `
      <div class="card cuenta ${c.categoria === "ahorro" ? "ahorro" : ""}">
        <span>${c.nombre}</span>
        <span>${c.tipo}</span>
        <span>${c.categoria}</span>
        <span>${(c.saldo/100).toFixed(2)}</span>
      </div>
    `
    	
    options += `<option value="${c.id}" data-categoria="${c.categoria}">${c.nombre}</option>`
  })

  const totalContainer = document.getElementById("totalContainer")
  const totalEl = document.getElementById("total")
  const totalFormateado = (total/100).toFixed(2)
  totalEl.innerHTML = totalFormateado
  document.getElementById("cuentas").innerHTML = html
  document.getElementById("cuenta").innerHTML = options
  if(total > 0){
	  totalContainer.style.color = "#00c853"
	  totalContainer.style.textShadow = "0px 0px 8px black"
	  
  }else if(total < 0){
	  totalContainer.style.color = "#ff5252"
	  totalContainer.style.textShadow = "0px 0px 8px black"
  }else{
	  totalContainer.style.color = "#000000"
  }
}

