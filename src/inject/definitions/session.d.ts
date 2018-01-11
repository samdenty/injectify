export namespace SocketSession {
  export class session {
    project: {
      id: string
      name: string
      inject: any
    }
    id: number
    debug: boolean
  }
  export class project {
    id: string
    name: string
    inject: any
  }
  export class inject {
    on: Function
    send: Function
  }
}