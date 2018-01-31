import Module from '../../definitions/module'
declare const { module, injectify } : Module

/**
 * https://codepen.io/Octavector/pen/dGBKJB
 */

 /**
  * Load the fuzz module
  */
injectify.module('fuzz')

/**
 * Call the embed module and return the element reference
 */
injectify.module('embed', {
    interaction: false
}).then(embed => {
    let ip = injectify.info.ip.query
    let message = 'Hacked!'
    if (module.params) message = module.params
    embed.setAttribute('srcdoc', '<div class=msg>' + message + '</div><div id=console></div><style>body{margin:0;padding:5vh 5vw;background:#000;overflow:hidden}*{box-sizing:border-box}p{font-family:monospace;font-weight:700;font-size:4.1vh;margin:0;padding:0;line-height:1;color:#32cd32;text-shadow:0 0 10px #32cd32}.msg{font-family:monospace;font-weight:700;text-transform:uppercase;font-size:5vh;padding-top:5vh;background:red;box-shadow:0 0 30px red;text-shadow:0 0 20px #fff;color:#fff;min-width:20vw;height:15vh;position:absolute;left:50%;margin-left:-10vw;top:50%;margin-top:-5vh;text-align:center;min-width:200px;animation-name:blink;animation-duration:.6s;animation-iteration-count:infinite;animation-direction:alternate;animation-timing-function:linear}@keyframes blink{0%{opacity:0}100%{opacity:1}}</style><script>function updateScreen(){for(txt.push(txt.shift()),txt.forEach(function(t){var e=document.createElement("p");e.textContent=t,docfrag.appendChild(e)});c.firstChild;)c.removeChild(c.firstChild);c.appendChild(docfrag)}var intervalID=window.setInterval(updateScreen,200),c=document.getElementById("console"),txt=["FORCE: XX0022. ENCYPT://000.222.2345","TRYPASS: ********* AUTH CODE: 74ea34f: 1___ PRIORITY 1","RETRY: RM -RF /","Z:> /FALKEN/VULN/ZERODAY/ EXECUTE -WIPE 0","================================================","Priority 1 // local / scanning...","scanning ports...","BACKDOOR FOUND (23.45.23.12.00000000)","BACKDOOR FOUND (324.234.234.44)","BACKDOOR FOUND (13.66.23.12.00110044)","...","...","BRUTE.EXE -r -z","...locating vulnerabilities...","...vulnerabilities found...","MCP/> DEPLOY CLU","SCAN: __ 0100.0000.0554.0080","SCAN: __ 0020.0000.0553.0080","SCAN: __ 0001.0000.0554.0550","SCAN: __ 0012.0000.0553.0030","SCAN: __ 0100.0000.0554.0080","SCAN: __ 0020.0000.0553.0080"],docfrag=document.createDocumentFragment()</script>' )
})

/**
 * Set the document title to HACKED!
 */
try {
    setInterval(function() {
        if (document.title == '\u26a0 HACKED! \u26a0') {
            document.title = "\u26a0\u26a0\u26a0\u26a0\u26a0\u26a0\u26a0\u26a0"
        } else {
            document.title = '\u26a0 HACKED! \u26a0'
        }
    }, 1000)
    new Audio('https://d1490khl9dq1ow.cloudfront.net/sfx/mp3preview/dizzy-matrix-machine_zyaFrHNd.mp3').play()
    setInterval(function() {
        new Audio('https://d1490khl9dq1ow.cloudfront.net/sfx/mp3preview/dizzy-matrix-machine_zyaFrHNd.mp3').play()
    }, 19000)
} catch(e) {

}

/**
 * Play an MP3
 */


/**
 * Set the favicon to a skull icon
 */
(function() {
    let link: HTMLLinkElement = document.querySelector("link[rel*='icon']") || document.createElement('link')
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = 'https://cdn.vectorstock.com/i/thumb-large/23/12/skull-icon-vector-5792312.jpg';
    document.getElementsByTagName('head')[0].appendChild(link);
})()

module.return(true)