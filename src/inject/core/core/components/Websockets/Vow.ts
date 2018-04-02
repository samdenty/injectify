import { Injectify } from '../../../definitions/core'
declare const injectify: typeof Injectify

type Actions = 'resolve' | 'reject'
export default function(action: Actions, id: string, data) {
  const vow = injectify.global.vows[id]
  if (vow) {
    const handle = vow[action]
    if (handle) {
      handle(data)
    } else {
      /// #if DEBUG
      injectify.debugLog(
        'vow',
        'warn',
        `WARNING: Unfulfilled Vow with ID "${id}"! Reason: callback-not-defined`,
        data
      )
      /// #endif
    }
  } else {
    /// #if DEBUG
    injectify.debugLog(
      'vow',
      'warn',
      `WARNING: Unfulfilled Vow with ID "${id}"! Reason: vow-not-defined`,
      data
    )
    /// #endif
  }
}
