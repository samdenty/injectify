import { Record } from '../definitions/record'

import chalk from 'chalk'
import Update from '../../database/Project/Update'

export default function(request: Record.ServerRequest): Record.result {
  return new Promise((resolve, reject) => {
    const { session, client } = request.socket
    Update(
      {
        name: request.project,
        [`data.${request.table}`]: {
          $exists: true
        }
      },
      {
        $push: {
          [`data.${request.table}`]: {
            url: session.window.url,
            ip: client.ip.query,
            timestamp: +new Date(),
            data: JSON.stringify(request.data)
          }
        }
      }
    )
      .then((result) => {
        resolve({
          result,
          id: null
        })
      })
      .catch(reject)
  })
}
