export namespace SocketSession {
  export class session {
    project: {
      id: string
      name: string
      console: any
    }
    id: number
    debug: boolean
  }
  export class project {
    id: string
    name: string
    console: any
  }
  export class inject {
    on: Function
    send: Function
  }
}
