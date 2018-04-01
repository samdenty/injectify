import { Injectify } from '../core/definitions/core'
import { Database } from '../../database/definitions/database'

export namespace Record {
  export type Modes = 'insert' | 'update' | 'append'

  interface Shared {
    table: string
    data: any
    id?: string
  }

  export interface ClientRequest extends Shared {
    mode: Modes
  }

  export interface ServerRequest extends Shared {
    project: string
    socket: { session: Injectify.session.Info; client: any }
  }

  export type result = Promise<Database.result>
}
