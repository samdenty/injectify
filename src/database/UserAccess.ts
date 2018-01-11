import { GitHub } from './definitions/github'

export default (db: any, user: GitHub.authUser | string, project: string) => {
  return new Promise((resolve, reject) => {
    if (typeof user === 'object') {

    } else {
      
    }
  })
}