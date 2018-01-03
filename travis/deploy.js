const chalk = require('chalk')
const exec = require('ssh-exec')

module.exports = () => {
    let host = process.env.sshhost
    let username = process.env.sshuser
    let password = process.env.sshpass
    let dir = process.env.sshdir
    let key = process.env.sshkey

    /**
     * Replace literal \n with newlines
     */
    key = key ? key.replace(/\\n/g, '\n') : undefined

    if (host && dir && username && (key || pass)) {
        let config = {
            user: username,
            host: host,
            key: key,
            password: password
        }
        if (!key) delete config.key
        if (!password) delete config.password
        exec(`cd "${dir}" && npm run pull`, config).pipe(process.stdout)
    }
}