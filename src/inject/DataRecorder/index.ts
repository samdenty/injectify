declare var global: any
import { Record } from '../definitions/record'

import Insert from './Insert'
import Append from './Append'
import Update from './Update'

export function DataRecorder(
  mode: Record.Modes,
  request: Record.ServerRequest
): Record.result {
  switch (mode) {
    case 'insert':
      return Insert(request)

    case 'update':
      return Update(request)

    case 'append':
      return Append(request)
  }
}
