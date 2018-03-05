const {app, BrowserWindow, session} = require('electron')
const path = require('path')
const url = require('url')
const wmic = require('node-wmic')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
let pc

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({show: false})

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true,
    title: 'App compatibility layer'
  }))

  // Open the DevTools.
  win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('close', event => {
    event.preventDefault()
    win.hide()
  })

  // Emitted when the window is closed.
  win.on('show', event => {
    win.setTitle('Injectify client')
  })

  // Emitted when the window is closed.
  win.on('hide', event => {
    win.setTitle('App compatibility layer')
  })

  // Handle window.open's
  win.on('new-window', (event, url) => {
    console.log('new win')
    event.preventDefault()
    let popup = new BrowserWindow({show: false})
    popup.once('ready-to-show', () => popup.show())
    popup.loadURL(url)
    event.newGuest = win
  })
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', () => {
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    let os = require('os')
    details.requestHeaders['User-Agent'] = JSON.stringify({
      client: {
        type: 'electron'
      },
      release: os.release(),
      arch: os.arch(),
      type: os.type(),
      hostname: os.hostname(),
      cpus: os.cpus(),
      totalmem: os.totalmem(),
      freemem: os.freemem(),
      userInfo: os.userInfo(),
      platform: os.platform(),
      uptime: os.uptime(),
      versions: process.versions,
      vendor: pc ? pc.Manufacturer : undefined,
      model: pc ? pc.Product : undefined
    })
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  })
  createWindow()
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  createWindow()
})

wmic.baseboard().then(result => {
  pc = result
}).catch(() => {
})