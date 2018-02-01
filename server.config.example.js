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
      client_secret: 'MY_APP_SECRET',
      scope: 'user gist public_repo'
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
     * Make it available over the internet without port forwarding
     */
    localtunnel: {
      enable: true,
      /**
       * Set the below variable to use a custom fixed domain
       * Subdomains must be lowercase and between 4 and 63 alphanumeric characters.
       *
       * Set to false to default to random domain
       */
      subdomain: false
    },

    /**
     * Rate limiting
     */
    rateLimiting: {
      /**
       * Injectify project API aka 'View JSON'
       *
       * This requires a lot of CPU to perform (database side)
       */
      api: {
        windowMs: 2 * 60 * 1000,
        max: 70,
        delayAfter: 10,
        delayMs: 300,
        message: JSON.stringify({
          success: false,
          reason: 'Too many requests, please try again later'
        }, null, '    ')
      },
      inject: {
        /**
         * The Inject client auth API
         *
         * Every time a client loads / reloads the page the
         * auth API is called by the client from the websocket.
         */
        auth: {
          windowMs: 2 * 60 * 1000,
          max: 100,
          headers: false, // As little as possible information should be sent to target
          statusCode: 204, // URL will be displayed in targets console if an error code is returned
          message: '',
          delayAfter: 30,
          delayMs: 100
        },
        /**
         * The Inject websocket data limiter
         *
         * Prevents the client from flooding the server with
         * websocket messages, this can often happen due to an
         * infinite loop.
         */
        websocket: {
          windowMs: 2 * 1000,
          max: 30
        }
      }
    },

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
      webhook: 'INSERT_WEBHOOK_URL',
      /**
       * WidgetBot discord widgets
       *
       * Sign up at https://widgetbot.io, invite it to your server, make
       * sure you enable the appropriate channel and replace the below values
       *
       * Crate documentation: https://docs.widgetbot.io
       */
      widgetbot: {
        server: '335836376031428618',
        channel: '377173106940182529',
        options: '0002',
        colors: {
          toggle: '#3F51B5'
        },
        style: 'material',
        beta: false
      }
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
    script: './src/main.js',
    log_date_format: 'DD/MM/YY hh:mm',
    // enable the NodeJS debugger
    node_args: [
      // '--inspect-port=0.0.0.0:18999'
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
