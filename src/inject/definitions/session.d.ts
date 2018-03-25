export namespace SocketSession {
  export class project {
    /**
     * Project ID
     */
    id: string
    /**
     * Project name
     */
    name: string
    /**
     * Project config object
     */
    config: any
  }

  export class session {
    /**
     * Project name
     */
    project: project
    /**
     * Client ID
     */
    id: number
    /**
     * Payload version
     */
    version: number
    /**
     * Whether the client is in debug mode
     */
    debug: boolean
  }

  export class inject {
    on: Function
    send: Function
  }
}
