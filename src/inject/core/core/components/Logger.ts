import instanceOf from '../lib/InstanceOf'

export default class {
  constructor(messages: any[]) {
    let parsedMessages: any = []
    for (let i = 0; i < messages.length; i++) {
      parsedMessages.push(this.type(messages[i]))
    }
    return parsedMessages
  }

  type(message: any) {
    if (message instanceof HTMLElement) {
      return {
        type: 'HTMLElement',
        message: {
          tagName: message.tagName.toLowerCase(),
          innerHTML: message.innerHTML
        }
      }
    } else {
      return {
        type: instanceOf(message),
        message: message
      }
    }
  }
}