import { Injectify } from '../../../definitions/core'
declare const injectify: typeof Injectify

export default function(state?: boolean): 'hooked' | 'unhooked' {
  if (!state && console['hooked']) {
    console['unhook']()
    return 'unhooked'
  } else if (!console['hooked']) {
    ((Console) => {
      // @ts-ignore
      window['console'] = {
        ...Console,
        Console: Console,
        log() {
          Console.log.apply(this, arguments)
          injectify.log.apply(this, arguments)
        },
        info: this.log,
        warn() {
          Console.warn.apply(this, arguments)
          injectify.warn.apply(this, arguments)
        },
        error() {
          Console.error.apply(this, arguments)
          injectify.error.apply(this, arguments)
        },
        table() {
          Console.table.apply(this, arguments)
          injectify.table.apply(this, arguments)
        },
        unhook() {
          console = Console
        },
        clear() {
          Console.clear()
          injectify.send('l', {
            type: 'info',
            message: [{
              type: 'broadcast',
              message: `Client's console was cleared`
            }]
          })
        },
        hooked: true
      }
    })(console)
    return 'hooked'
  }
}