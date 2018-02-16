declare const global: any
import { Database } from '../definitions/database'

export default (find: string | Object, action: any) => {
  return new Promise<{
    n: number
    nModified: number
    opTime: {
      ts:
      {
        _bsontype: string
        low_: number
        high_: number
      }
      t: 3
    }
    electionId: number
    ok: number
  }>((resolve, reject) => {
    if (typeof find === 'string') find = {
      name: find
    }

    global.db.collection('projects', (err, projects) => {
      if (!err) {
        projects.updateOne(find, action).then(({result}) => resolve(result)).catch(reject)
      } else {
        reject(err)
      }
    })
  })
}