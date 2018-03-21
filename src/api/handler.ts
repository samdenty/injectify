import chalk from 'chalk'

import GithubUser from '../database/GithubUser'
import UserPermissions from '../database/UserPermissions'
import { Request, Response } from 'express'

import * as graphqlHTTP from 'express-graphql'

import { schema, root } from './GraphQL'

export default class {
  db: any

  constructor(mongodb: any) {
    this.db = mongodb
  }

  graphqlHTTP = graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true
  })

  graphql() {
    return (req: Request, res: Response) => {
      const { token } = req.query

      if (token) {
        GithubUser(token)
          .then((user) => {
            ;(<any>req).user = user
            this.graphqlHTTP(req, res)
          })
          .catch(({ title, message }) => {
            return this.error(res, title, message)
          })
      } else {
        return this.error(
          res,
          'Unauthorised request',
          `All requests must contain your GitHub token as a query parameter`
        )
      }
    }
  }

  error(res: Response, message: string, description?: string) {
    return res.status(401).json({
      errors: [
        {
          // type: 'GraphQL middleware',
          message,
          description
        }
      ]
    })
  }

  json(req: any, res: any) {
    let token: string = req.query.token
    let page: string = req.path.split('/')[2]
    let project: string = decodeURIComponent(req.path.split('/')[3])
    if (token && project && (page === 'clients' || page === 'data')) {
      GithubUser(token)
        .then((user) => {

        })
        .catch((error) => {
          res.status(401).json(error)
        })
    } else {
      res.status(400).json({
        title: 'Bad request',
        message:
          'Make sure you specify a project, page and token in the request',
        format: `/api/${page || '$page'}/${project ||
          '$project'}?token=${token || '$token'}`
      })
    }
  }
}
