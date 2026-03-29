/* ./myFinanzas/js/auth.js */

async function login(){

	const email = document.getElementById("email").value
	const password = document.getElementById("password").value

	const { error } = await supabaseClient.auth.signInWithPassword({
	email: email,
	password: password
	})

	if(error){
		alert(error.message)
	}else{
		localStorage.setItem("loginTime", Date.now())
		checkSession()
	}
}

async function logout(){
		await supabaseClient.auth.signOut() 
		mostrarLogin()
}

async function checkSession(){
		const { data } = await supabaseClient.auth.getSession()
		
		if(data.session && !isSessionExpired()){
			mostrarApp()
		}else{
			await supabaseClient.auth.signOut()
			localStorage.removeItem("loginTime")
			mostrarLogin()
		}
}

function mostrarApp(){
		document.getElementById("loginBox").style.display = "none"
		document.getElementById("appBox").style.display = "block"
		
		toggleTracking(true)
		cargarCuentas()
		cargarCuentasGestion()
		cargarMovimientos()
}

function mostrarLogin(){
		document.getElementById("loginBox").style.display = "block"
		document.getElementById("appBox").style.display = "none"
		
		toggleTracking(false)
}
