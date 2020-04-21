const db = require('../utils/db')
// prevent memory leaks add this module to socket config
require('events').EventEmitter.defaultMaxListeners = 10;

const sockt = (io) => {
    //io.sockets.setMaxListeners(0) // turn off socket.maxlisteners to zero 

    io.on('connection', (socket) => {
        console.log("-> SOCKET IO CONNECTED")

        // data dikirim setiap 2 detik
        socket.on("get_data", (data) => {
            db.query("SELECT * FROM table_calon", (err, results) => {
                const id = results
                // dapatkan daftar data hasil pemungutan suara
                db.query("SELECT * FROM result", (err, results) => {
                    const rsl = results
                    socket.emit("data", {id, rsl})
                })
            })
        })

        socket.on("disconnect", () => {
            console.log("-> Disconnect from admin panel ")
        })

    })
}

module.exports = sockt;