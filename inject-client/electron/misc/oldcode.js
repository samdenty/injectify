const alert = (msg, title) => {
    let show = win.isVisible()
    let alwaysOnTop = win.isAlwaysOnTop()
    let minimize = win.isMinimized()
    if (!show) win.show()
    if (!minimize) win.minimize()
    if (!alwaysOnTop) win.setAlwaysOnTop(true)
    win.focus()
    window.focus()
    if (!title) {
        /**
         * Prevent electron from being displayed in window title
         */
        window.alert(msg, ' ')
    } else {
        window.alert(msg, title)
    }
    if (!show) win.hide()
    if (!alwaysOnTop) win.setAlwaysOnTop(false)
    if (minimize) win.minimize()
}