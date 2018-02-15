import ModuleTypings from '../../../../definitions/module'
import { Mutation } from '../definitions/mutation'
declare const { Module, injectify }: ModuleTypings

export default class {
  listener = null

  constructor() {
    this.disconnect()
    let docID = this.IDElements(document.documentElement)
    injectify.debugLog('page-ghost', 'debug', `Indexed document with ID ${docID}`)
    this.listener = new MutationObserver(this.observer.bind(this))
    this.listener.observe(document.documentElement, {
      childList: true,
      attributes: true,
      characterData: true,
      subtree: true,
      attributeOldValue: true,
      characterDataOldValue: true
    })
  }

  observer(mutations: MutationRecord[]) {
    mutations.forEach((mutationEvent) => {
      // Prevent Node indexer from recursively calling the mutation handler
      if (mutationEvent.attributeName === '_-_') return
      let mutation: Mutation.mutation = {
        element: <HTMLElement>mutationEvent.target,
        id: this.IDElements(<HTMLElement>mutationEvent.target),
        type: mutationEvent.type,
        data: []
      }
      if (mutation.type === 'childList') {
        if (mutationEvent.addedNodes.length) {
          let nodes = mutationEvent.addedNodes
          for (let i = 0; i < nodes.length; i++) {
            let node = <HTMLElement>nodes[i]
            mutation.data.push({
              type: 'addition',
              html: node.outerHTML
            })
          }
        }
        if (mutationEvent.removedNodes.length) {
          let nodes = mutationEvent.removedNodes
          for (let i = 0; i < nodes.length; i++) {
            let node = <HTMLElement>nodes[i]
            mutation.data.push({
              type: 'removal',
              id: node.getAttribute('_-_')
            })
          }
        }
      } else if (mutation.type === 'attributes') {
        mutation = <Mutation.attributes>{
          ...mutation,
          data: {
            name: mutationEvent.attributeName,
            value: mutation.element.getAttribute(mutationEvent.attributeName)
          },
        }
      } else if (mutation.type === 'characterData') {
        console.dir(mutation, mutationEvent)
        mutation = <Mutation.characterData>{
          ...mutation,
          data: (<any>mutation.element).data
        }
      }
      /**
       * Remove unnecessary data
       */
      if (mutation.data instanceof Array && mutation.data.length === 0) delete mutation.data
      delete mutation.element
      injectify.send('p', {
        mutation
      })
      injectify.debugLog('page-ghost', 'debug', `Element with ID "${mutation.id}" performed a ${mutation.type} change`, mutation)
    })
  }

  /**
   * Recursively ID an element and all it's children
   */
  IDElements(node: HTMLElement, shouldIndex: boolean = true) {
    if (node instanceof Text) {
      node = <HTMLElement>node.parentNode
      shouldIndex = false
    }
    let id = this.IDNode(node)
    if (shouldIndex) {
      let elements = node.getElementsByTagName('*')
      for (let i = 0; i < elements.length; i++) {
        this.IDNode(<HTMLElement>elements[i])
      }
    }
    return id
  }

  /**
   * Generate a unique ID that is not used anywhere else in the DOM
   */
  get id() {
    let id = (++Module.state.dom.index).toString()
    if (document.querySelectorAll(`[_-_=${JSON.stringify(id)}]`).length) {
      return this.id
    } else {
      return id
    }
  }

  /**
   * ID a specific Node
   */
  IDNode(node: HTMLElement) {
    let id = node.getAttribute('_-_')
    if (id) {
      let nodesWithSameID = document.querySelectorAll(`[_-_=${JSON.stringify(id)}]`)
      if (nodesWithSameID.length > 1) {
        for (let i = 1; i < nodesWithSameID.length; i++) {
          let element = nodesWithSameID[i]
          node.setAttribute('_-_', this.id)
        }
      }
      return node.getAttribute('_-_')
    } else {
      id = this.id
      node.setAttribute('_-_', id)
      return id
    }
  }

  disconnect() {
    if (this.listener) this.listener.disconnect()
  }
}