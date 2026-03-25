/* ./myFinanzas/js/session.js */
let inactivityTimer
let isTracking = false

const INACTIVITY_TIME = 10 * 60 * 1000

const events = ["click", "keypress", "scroll", "mousemove", "touchstart"]

function toggleTracking(enable){
		if(enable && !isTracking){
			isTracking = true
			events.forEach(e => document.addEventListener(e, resetTimer))
			resetTimer()
		}
		if(!enable && isTracking){
			isTracking = false
			events.forEach(e => document.removeEventListener(e, resetTimer))
			clearTimeout(inactivityTimer)
		}
}

function isSessionExpired(){
	const loginTime = localStorage.getItem("loginTime")
	const ahora = Date.now()
	const MAX_TIME = 30 * 60 * 1000
	
	return !loginTime || (ahora - loginTime > MAX_TIME);
}
function resetTimer(){
	if(!isTracking) return
	
	clearTimeout(inactivityTimer)
		
	inactivityTimer = setTimeout(() => {
			alert("Sesion cerrada por inactividad")
			logout()
	}, INACTIVITY_TIME)
}
