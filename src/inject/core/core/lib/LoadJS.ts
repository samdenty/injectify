export default function (urls: string | string[]) {
  // @ts-ignore
  return new Promise((resolve, reject) => {
    if (typeof urls === 'string') urls = [urls]
    /**
     * Create an array with all the loaded libraries on the page
     */
    let scripts = document.getElementsByTagName('script')
    let libraries = []
    for (let i = 0; i < scripts.length; i++) {
      let script: HTMLScriptElement = scripts[i]
      if (script.src) libraries.push(script.src)
    }

    let currentUrl = 0;
    (function load(i: number) {
      let url = urls[i]
      if (libraries.indexOf(url) > -1) {
        if (i === urls.length - 1) {
          resolve()
        } else {
          currentUrl++
          load(currentUrl)
        }
      } else {
        let script = document.createElement('script')
        script.src = url
        document.head.appendChild(script)
        script.onload = () => {
          if (i === urls.length - 1) {
            resolve()
          } else {
            currentUrl++
            load(currentUrl)
          }
        }
        script.onerror = () => {
          reject(`Failed to load script "${url}"`)
          urls = []
        }
      }
    })(currentUrl)
  })
}