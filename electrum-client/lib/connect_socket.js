'use strict';

const connectSocket = (conn, port, host) => {
    return new Promise((resolve, reject) => {
        const errorHandler = (e) => reject(e)
        conn.connect(port, host, () => {
            conn.removeListener('error', errorHandler)
            resolve()
        })
        conn.on('error', errorHandler)
    })
}

module.exports = connectSocket
