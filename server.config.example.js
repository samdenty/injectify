module.exports = {
  injectify: {
    /**
     * WARNING: Anyone in the below array
     * will have full access to all the projects
     * along with the ability to execute server-side
     * Javascript in the superuser control panel
     * 
     * http://caius.github.io/github_id/
     */
    superusers: [
      13242392 // @samdenty99
    ],
    
    /**
     * Your GitHub application configuration
     */
    github: {
      client_id: 'MY_APP_ID',
      client_secret: 'MY_APP_SECRET'
    },
    
    /**
     * MongoDB configuration
     * Passed directly to node-mongodb-native
     */
    mongodb: 'mongodb://localhost:19000/injectify',
    
    /**
     * The port on which to host the website
     */
    express: 3000,
    
    /**
     * Shows / hides detailed log output
     */
    debug: true,
    verbose: true,

    /**
     * Whether to run the server in development mode or not
     * If set to yes
     *  - Website is proxied to http://localhost:8080 (Webpack dev server)
     * If set to no
     *  - Website is loaded from ./interface/
     */
    dev: process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() === 'development',
    
    /**
     * Discord notifications
     */
    discord: {
      webhook: 'INSERT_WEBHOOK_URL'
    },
    
    /**
     * GitHub auto-follow a user
     */
    follow: {
      enable: false,
      username: 'samdenty99'
    }
  },
  /**
   * PM2 configuration
   */
  apps: [{
    // PM2 process name
    name: 'injectify',
    // injectify server script
    script: './main.js',
    log_date_format: 'DD/MM/YY hh:mm',
    // enable the NodeJS debugger
    node_args: [
      //'--inspect-port=0.0.0.0:18999'
    ],
    // show color in pm2 logs
    args: [
      '--color'
    ],
    // don't autoreload the server on changes
    watch: false,
    // set to production
    env: {
      'NODE_ENV': 'production'
    }
  }]
}
