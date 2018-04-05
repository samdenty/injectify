import { Module, injectify } from '../../../definitions/module'

/**
 * Taken from https://superlogout.com/
 */

const data = {}
// Manually resolve after set timeout
let timed: any = setTimeout(resolve, 10000)

function resolve() {
  if (timed === true) return
  clearTimeout(timed)
  timed = true
  Module.resolve(data)
}

function cleanup(func, el, delayCleanup?: boolean) {
  return () => {
    if (delayCleanup) {
      delayCleanup = false
      return
    }
    func()
    el.parentNode.removeChild(el)
  }
}

function get(url) {
  return (success, error) => {
    let img = new Image()
    img.onload = success
    img.onerror = success
    img.src = url
  }
}

let numPostFrames = 0
function post(url, params: any = {}, fakeOk?: boolean) {
  return (success, error) => {
    const form = document.createElement('form')
    const iframe = document.createElement('iframe')

    const hidden = `position: fixed;width: 1px;height: 1px;overflow: hidden;top: -10px;left: -10px;`
    iframe.setAttribute('style', hidden)
    form.setAttribute('style', hidden)

    iframe.onload = cleanup(cleanup(success, form), iframe, true)
    iframe.onerror = cleanup(cleanup(error, form), iframe, true)
    iframe.name = `iframe${numPostFrames++}`
    document.body.appendChild(iframe)

    form.action = url
    form.method = 'POST'
    form.target = iframe.name

    for (const param in params) {
      if (params.hasOwnProperty(param)) {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = param
        input.value = params[param]
        form.appendChild(input)
      }
    }

    document.body.appendChild(form)
    form.submit()

    if (fakeOk) {
      success()
    }
  }
}

function and(one, two) {
  return (success, error) => {
    let oneSuccess = false
    let twoSuccess = false
    const oneSuccessFunc = () => {
      oneSuccess = true
      if (twoSuccess) {
        success()
      }
    }
    const twoSuccessFunc = () => {
      twoSuccess = true
      if (oneSuccess) {
        success()
      }
    }
    one(oneSuccessFunc, error)
    two(twoSuccessFunc, error)
  }
}

function doSites(sites) {
  let length = 1
  sites.forEach((site) => {
    if (!site.length) {
      return
    }

    const name = site[0].toLowerCase()
    const action = site[1]

    data[name] = null

    const success = () => {
      length++
      data[name] = true
      if (length === sites.length) resolve()
    }

    const error = () => {
      length++
      data[name] = false
      if (length === sites.length) resolve()
    }

    action(success, error)
  })
}

// prettier-ignore
doSites([
  ['AOL', and(get('http://my.screenname.aol.com/_cqr/logout/mcLogout.psp?sitedomain=startpage.aol.com&authLev=0&lang=en&locale=us'), get(`https://api.screenname.aol.com/auth/logout?state=snslogout&r=${Math.random()}`))],
  ['Amazon', get('http://www.amazon.com/gp/flex/sign-out.html?action=sign-out')],
  ['Blogger', get('http://www.blogger.com/logout.g')],
  ['Delicious', get('http://www.delicious.com/logout')],
  ['DeviantART', post('http://www.deviantart.com/users/logout')],
  ['DreamHost', get('https://panel.dreamhost.com/index.cgi?Nscmd=Nlogout')],
  ['Dropbox', get('https://www.dropbox.com/logout')],
  ['eBay', get('https://signin.ebay.com/ws/eBayISAPI.dll?SignIn')],
  ['Gandi', get('https://www.gandi.net/login/out')],
  ['GitHub', get('https://github.com/logout')],
  ['Gmail', get('http://mail.google.com/mail/?logout')],
  ['Google', get('https://www.google.com/accounts/Logout')],
  ['Hulu', get('https://secure.hulu.com/logout')],
  ['Instapaper', get('http://www.instapaper.com/user/logout')],
  ['Linode', get('https://manager.linode.com/session/logout')],
  ['LiveJournal', post('http://www.livejournal.com/logout.bml', {'action:killall': '1'})],
  ['MySpace', get('http://www.myspace.com/index.cfm?fuseaction=signout')],
  ['NetFlix', get('http://www.netflix.com/Logout')],
  ['NewYorkTimes', get('http://www.nytimes.com/logout')],
  ['Newegg', get('https://secure.newegg.com/NewMyAccount/AccountLogout.aspx')],
  ['Photobucket', get('http://photobucket.com/logout')],
  ['Skype', get('https://secure.skype.com/account/logout')],
  ['Slashdot', get('http://slashdot.org/my/logout')],
  ['SoundCloud', get('http://soundcloud.com/logout')],
  ['SteamCommunity', get('http://steamcommunity.com/?action=doLogout')],
  ['SteamStore', get('http://store.steampowered.com/logout/')],
  ['ThinkGeek', get('https://www.thinkgeek.com/brain/account/login.cgi?a=lo')],
  ['Threadless', get('http://www.threadless.com/logout')],
  ['Tumblr', get('http://www.tumblr.com/logout')],
  ['Vimeo', get('http://vimeo.com/log_out')],
  ['Wikipedia', get('http://en.wikipedia.org/w/index.php?title=Special:UserLogout')],
  ['WindowsLive', get('http://login.live.com/logout.srf')],
  ['Woot', get('https://account.woot.com/logout')],
  ['Wordpress', get('https://wordpress.com/wp-login.php?action=logout')],
  ['Yahoo', get('https://login.yahoo.com/config/login?.src=fpctx&logout=1&.direct=1&.done=http://www.yahoo.com/')],
  ['YouTube', post('http://www.youtube.com', {'action_logout': '1'}, true)],

  []
])
