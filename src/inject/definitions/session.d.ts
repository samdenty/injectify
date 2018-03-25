export namespace SocketSession {
  export class project {
    id: string
    name: string
    config: any
  }

  export class session {
    project: project
    id: number
    debug: boolean
  }

  export class inject {
    on: Function
    send: Function
  }
}
