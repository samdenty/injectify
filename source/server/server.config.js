module.exports = {
  apps : [{
    name        : "injectify-server",
    script      : "./main.js",
    watch       : true,
    env: {
      "NODE_ENV": "development",
    },
    env_production : {
       "NODE_ENV": "production"
    }
  },
}