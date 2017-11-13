module.exports = {
  apps : [{
    name        : "injectify-server",
    script      : "./main.js",
    node_args: [
      "--inspect=18999"
    ],
    watch       : false,
    env: {
      "NODE_ENV": "production",
    }
  }]
}