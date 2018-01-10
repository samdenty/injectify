// import 

export default (db: any, user: [{ id: number } | string], project: string) => {
  return new Promise((resolve, reject) => {
    db.collection('projects', (err, projects) => {
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
          'name': name
        }]
      }).then(doc => {
        if (doc !== null) {
        }
      })
    })
  })
}