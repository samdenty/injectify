import { Url } from 'url'

/**
 * Inject core typings
 *
 * Imported & used in the Injectify UI's monaco-editor
 */

export namespace Injectify {
  //1
  interface info {
    project: string
    server: {
      websocket: string
      url: Url | string
    }
    id: number
    platform: 'browser' | 'electron' | 'node'
    duration: number
    debug: boolean
    os: false | any
    ip: {
      city?: string
      country?: string
      ll: number[]
      metro: number
      query: string
      range: number[]
      region: string
      zip: number
    }
    headers: any
    'user-agent': any
  }

  /**
	 * Returns an object containing information about the current Injectify session
	 */
  export var info: info

  interface sessionInfo {
    window: {
      url: Url | string
      title: string
      active: boolean
    }
  }
  /**
	 * Returns information about the current session, browser etc.
	 */
  export var sessionInfo: sessionInfo

  /**
	 * Sends the session info to the server
	 */
  export function sendSession()

  /**
	 * Returns whether Injectify was loaded in debugging mode or not.
	 * [true]: being used in development;
	 * [false]: console output should be suppressed
	 */
  export var debug: boolean

  /**
	 * Returns the amount of time connected to injectify server
	 */
  export var duration: number

  /**
   * Returns the time when the client connected to the injectify server
   */
  export var connectTime: number

  /**
	 * Returns the global config
	 */
  interface global {
    listeners: {
      visibility: boolean
      timed: {
        active: boolean
        prevState: string | JSON
      }
    }
  }
  export var global: global

  /**
	 * Updates the global state
   * @param nextState An object containing the nextState
	 */
  export function setState(nextState: any)

  /**
	 * Passes the clients window.console logs over to Injectify, whilst still showing them in the clients console.
	 * @param state Override or don't override
	 */
  export function console(state?: boolean) : 'hooked' | 'unhooked'

	/**
	 * Loads a module from the injectify server
	 * @param name Module name
	 * @param params Module parameters
	 * @param callback Module callback
   * @param errorCallback Module error callback
	 */
  interface module {
    module(topic: 's', params?: 'a')
  }
  export function module()

  /**
	 * Authenticates the client to the Injectify database
   * @param auth Inject websocket token to use
	 */
  export function auth(token?: string)

  /**
   * Returns whether the Injectify core is the available or not
   */
  export var present: true

  /**
	 * Logs messages to the InjectJS console
	 * @param messages Comma-seperated list of messages to be logged
	 */
  export function log(...messages: any[])

  /**
	 * Logs warnings to the InjectJS console
	 * @param messages Comma-seperated list of messages to be logged
	 */
  export function warn(...messages: any[])

  /**
	 * Logs error messages to the InjectJS console
	 * @param messages Comma-seperated list of messages to be logged
	 */
  export function error(...messages: any[])

  /**
	 * Logs the result of a function to the InjectJS console
	 * @param data Data to be logged
	 */
  export function result(data: any)


	/**
	 * CAUTION: This will prevent you from executing any other commands
   *
   * Overrides the message handler for the websocket connection
	 * @param callback Callback to be triggered once message received
	 */
  export function listener(callback: Function)

  /**
	 * Listen for a topic from the websocket connection
	 * @param topic Topic name to listen to
	 * @param callback Callback to be triggered once received
   * @param once Only listen for the first event
	 */
  export function listen(topic: string, callback, once?: boolean)

  /**
	 * Removes a listener from a websocket topic listener
	 * @param topic Topic name to unlisten
	 * @param callback
	 */
  export function unlisten(topic: string, callback?: any)


  /**
	 * Send data to websocket
	 * @param topic Message topic
	 * @param data Message data
	 */
  export function send(topic: string, data?: any)

  /**
	 * Get the websocket ping time (in milliseconds)
	 * @param callback Callback to be executed on ping complete
	 */
  export function ping(callback: Function)

  /**
	 * Safely execute a script with hidden context. Appears as 'VMXXX:1' in DevTools
	 * @param func the contents inside the <script> tag
	 * @param element element to execute the script under, defaults to document.head
	 */
  export function exec(func: Function | string, element?: HTMLElement)
  //2
}