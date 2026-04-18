/* ./myFinanzas/js/ui.js: */
import { mostrarVista } from "./app.js"

export function mostrarApp(){
  document.getElementById("loginBox").style.display = "none"
  document.getElementById("appContainer").style.display = "block"

  mostrarVista("viewDashboard")
}

export function mostrarLogin(){
  document.getElementById("loginBox").style.display = "block"
  document.getElementById("appContainer").style.display = "none"

  // limpiar password
  document.getElementById("password").value = ""
}
