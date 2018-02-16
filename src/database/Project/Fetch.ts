declare const global: any
import { Database } from '../definitions/database'

export default (project: string) {
  return new Promise<Database.project>((resolve, reject) => {
    global.db.collection('projects', (err, projects) => {
      if (!err) {
        projects.findOne({
          name: project
        }).then((doc: Database.project) => {
          if (doc !== null) {
            resolve(doc)
          } else {
            reject(`Project "${project}" doesn't exist`)
          }
        })
      } else {
        reject(err)
      }
    })
  })
}