import { GitHub } from "./definitions/github"
import { Database } from "./definitions/database"

export default class {
  db: any

  constructor(db: any) {
    this.db = db
  }

  query(project: string, user: GitHub.authUser) {
    return new Promise<{ permission: number, doc: Database.project }>((resolve, reject) => {
      this.db.collection('projects', (err, projects) => {
        if (err) throw err
        projects.findOne({
          $or: [
            {
              'permissions.owners': user.id
            },
            {
              'permissions.admins': user.id
            },
            {
              'permissions.readonly': user.id
            }
          ],
          $and: [{
            'name': project
          }]
        }).then((doc: Database.project) => {
          if (doc !== null) {
            let { permissions } = doc

            let permission = {
              level: 0,
              group: null
            }
            if (permissions.readonly.includes(user.id)) {
              permission = {
                level: 1,
                group: 'readonly'
              }
            } else if (permissions.admins.includes(user.id)) {
              permission = {
                level: 2,
                group: 'admins'
              }
            } else if (permissions.owners.includes(user.id)) {
              permission = {
                level: 1,
                group: 'owners'
              }
            }

            if (permission.group && permission.level) {
              resolve({
                permission: permission,
                doc: doc
              })
            } else {
              reject({
                title: 'Access denied',
                message: `You don't have permission to access project ${project}`
              })
            }
          } else {
            reject({
              title: 'Access denied',
              message: `Project ${project} doesn't exist`
            })
          }
        })
      })
    })
  }
}