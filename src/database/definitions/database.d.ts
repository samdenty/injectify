import { GitHub } from './github'

export namespace Database {
  export interface user {
    _id: string
    username: string
    id: number
    payment: {
      account_type: 'free' | 'pro' | 'elite'
      method: string
    }
    github: GitHub.authUser
    logins: object
  }

  export interface project {
    _id: string
    name: string
    permissions: {
      owners: Array<number>
      admins: Array<number>
      readonly: Array<number>
    }
    config: {
      filter: {
        type: 'whitelist' | 'blacklist'
        domains: Array<object>
      }
      autoexecute: string
      created_at: string
    }
    data: {
      [table: string]: {
        url: string
        ip: string
        timestamp: number
        data: any
      }[]
    }
  }

  export interface result {
    n: number
    nModified: number
    opTime: {
      ts: {
        _bsontype: string
        low_: number
        high_: number
      }
      t: 3
    }
    electionId: number
    ok: number
  }
}
