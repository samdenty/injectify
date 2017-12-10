module.exports = {
  injectify: {
    github: {
      client_id: '95dfa766d1ceda2d163d',
      client_secret: '1809473ac6467f85f483c33c1098d4dadf8be9e8'
    },
    debug: true,
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
