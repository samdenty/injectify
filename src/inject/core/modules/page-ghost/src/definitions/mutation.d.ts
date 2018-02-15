export namespace Mutation {
  interface mutation {
    element: HTMLElement
    id: string
    type: string
    data: any
  }

  interface childList extends mutation {
    type: 'childList'
    data: Array<{
      type: 'addition' | 'removal'
      html: string
    }> | Array<{
      id: string
    }>
  }

  interface characterData extends mutation {
    type: 'characterData'
    data: string
  }

  interface attributes extends mutation {
    type: 'attributes'
    data: {
      name: string
      value: string
    }
  }
}