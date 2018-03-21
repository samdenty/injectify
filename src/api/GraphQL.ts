import * as fs from 'fs-extra'
import * as _ from 'lodash'
const { buildSchema } = require('graphql')
import UserPermissions from '../database/UserPermissions'

export const schema = buildSchema(
  fs.readFileSync(__dirname + '/schema.gql').toString()
)

export const root = {
  project: ({ name }, req) => {
    return new Promise((resolve, reject) => {
      new UserPermissions((<any>global).db)
        .query(name, req.user)
        .then(({ doc }) => {
          resolve({
            ...doc,
            tables: _.keys(doc.data),
            table: ({ name }) => {
              return doc.data[name]
            },
          })
        })
        .catch(({ message }) => {
          reject(message)
        })
    })
  },
  user: (args, req) => {
    return req.user
  }
}
