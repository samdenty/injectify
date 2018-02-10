interface MessageData {
  clientX?: number
  clientY?: number

  innerHeight?: number
  innerWidth?: number
}

document.addEventListener('DOMContentLoaded', () => {
  new class {
    iframe = document.getElementsByTagName('iframe')[0]
    constructor() {
      window.addEventListener('message', ({data}:{data:MessageData}) => {
        this.update(data)
      })
    }

    update(data: MessageData) {
      data.
    }
  }
})