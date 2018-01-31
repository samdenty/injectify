export namespace Module {
  export class yml {
    name: string[]
    description: string
    author: string
    minify: boolean
    params?: {
      optional?: boolean
      info: string
      typings?: string
    }
    returns: string
  }
}