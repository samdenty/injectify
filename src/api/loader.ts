import Spoof from './Spoof'
import Payload from './Payload'

export default class {
  db: any

  constructor(mongodb: any) {
    this.db = mongodb
  }
  
  spoof(req: any, res: any) {
    let token:string = req.query.token
    let index:number = parseInt(req.query.index)
    let project:string = decodeURIComponent(req.path.substring(11))
    /**
     * Validate the token exists, the index is a number and the project param exists
     */
    if (token && !Number.isNaN(index) && project) {
      let api = new Spoof(this.db)
      api.query(token, index).then(json => {
        console.log(json)
      }).catch(error => {
        console.log(error)
      })
    } else {
      res.json({
        title: 'Bad request',
        message: 'Make sure you specify a project, index and token in the request',
        format: '/api/spoof/$project?index=$index&token=$token'
      })
    }
  }

  payload(req: any, res: any) {
    new Payload(this.db).then()
  }
}