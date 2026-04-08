/* ./myFinanzas/js/ui.js: */
function mostrarApp(){
  document.getElementById("loginBox").style.display = "none"
  document.getElementById("appContainer").style.display = "block"

  mostrarVista("viewDashboard")
}

function mostrarLogin(){
  document.getElementById("loginBox").style.display = "block"
  document.getElementById("appContainer").style.display = "none"

  // limpiar password
  document.getElementById("password").value = ""
}
