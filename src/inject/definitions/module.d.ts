export namespace Module {
  export class yml {
    name: string[]
    description: string
    author: string
    minify?: boolean
    server_side?: boolean
    params?: {
      optional?: boolean
      info: string
      typings?: string
    }
    returns?: string
  }

  export interface Cache {
    name: string[]
    production_bundle: string
    debug_bundle?: string
    config: Module.yml
  }
}
