module.exports = {
  apps : [{
    name        : "injectify-server",
    script      : "./main.js",
    watch       : false,
    env: {
      "NODE_ENV": "production",
    }
  }]
}