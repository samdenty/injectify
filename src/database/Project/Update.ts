declare const global: any
import { Database } from '../definitions/database'

export default (find: string | Object, action: any) => {
  return new Promise<Database.result>((resolve, reject) => {
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
