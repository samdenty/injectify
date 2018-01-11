const octonode = require('octonode')
import { GitHub } from './definitions/github'

export default (token: string) => {
  return new Promise<GitHub.authUser>((resolve, reject) => {
    let client = octonode.client(token)
    client.get('/user', {}, (err, status: number, user: GitHub.authUser) => {
      if (!err) {
        resolve(user)
      } else {
        reject({
          title: 'Could not authenticate you',
          message: status ? `GitHub returned response code ${status}` : `GitHub rejected token!`
        })
      }
    })
  })
}