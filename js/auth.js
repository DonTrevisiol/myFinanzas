/* ./myFinanzas/js/auth.js: */
async function login(){
  const email = document.getElementById("email").value
  const password = document.getElementById("password").value

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password })

  if(error){
    alert(error.message)
  }else{
    initApp()
  }
}

async function logout(){
  const confirmar = confirm("¿Cerrar sesión?")
  if(!confirmar) return

  await supabaseClient.auth.signOut()
  localStorage.removeItem("loginTime")
  mostrarLogin()
}

async function checkSession(){
  const { data } = await supabaseClient.auth.getSession()
  return data?.session
}
