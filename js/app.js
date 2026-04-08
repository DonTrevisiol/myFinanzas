/*	./myFinanzas/js/app.js:	*/
document.getElementById("btnLogin").addEventListener("click", login)
document.getElementById("btnLogout").addEventListener("click", logout)

initApp()

async function initApp(){

  const session = await checkSession()

  if(session){
    mostrarApp()
    cargarCuentas()
  }else{
	logout()
    mostrarLogin()
  }
}
