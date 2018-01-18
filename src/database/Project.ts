declare const global: any
import { Database } from './definitions/database'
const db = global.d

export default (project: string) => {
  return new Promise<Database.project>((resolve, reject) => {
    db.collection('projects', (err, projects) => {
      if (!err) {
        projects.findOne({
          name: project
        }).then(({doc} : {doc: Database.project}) => {
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