module.exports = {
  injectify: {
    superusers: [
      13242392
    ],
    github: {
      client_id: 'MY_APP_ID',
      client_secret: 'MY_APP_SECRET'
    },
    debug: true,
    verbose: true,
    mongodb: 'mongodb://localhost:19000/injectify',
    express: 3000,
    dev: process.env.NODE_ENV.toUpperCase() === 'DEVELOPMENT',
    follow: {
      enable: false,
      username: 'samdenty99'
    }
  },
  apps: [{
    name: 'injectify-server',
    script: './main.js',
    log_date_format: 'DD/MM/YY hh:mm',
    node_args: [
      '--inspect-port=0.0.0.0:18999'
    ],
    args: [
      '--color'
    ],
    watch: false,
    env: {
      'NODE_ENV': 'production'
    }
  }]
}
