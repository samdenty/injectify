export namespace Module {
  export class yml {
    name: string[]
    description: string
    author: string
    minify: boolean
    params?: {
      optional?: boolean
      typings?: string
    }
    returns: string
  }
}