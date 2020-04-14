const db = require('./db')
const formidable = require('formidable')
const path = require('path')
const fs = require('fs')

const send = (app) => {
    // upload data & gambar calon
    app.post('/up_calon/:calon/:visi', (req, res) => {
        // decode base64 nama calon
        const calon = req.params.calon
        const bff = new Buffer(calon, 'base64')
        const text = bff.toString('ascii')
        // decode base64 visi-misi
        const visi = req.params.visi
        const buf = new Buffer(visi, 'base64')
        const val = buf.toString('ascii')
        // initialization upload file
        const form = new formidable.IncomingForm();
        form.multiples = true
        form.uploadDir = path.join(__dirname, "../../public/img/calon")
        form.keepExtensions = true
        form.hash = true
        form.parse(req, function(err, fields, file) {
            if(!err) {
                // --> region upload
                const value = [text.toString(), val.toString()]
                // delete hash file
                let init = file.files.path
                let conf = init.split("/")
                let file_nm = conf[conf.length - 1]
                let path_fl = path.join(__dirname, "../../public/img/calon/") + file_nm
                fs.unlink(path_fl) // delete hash file
                // initialization variable for image name
                let init2 = file.foto.path
                let conf2 = init2.split("/")
                let file_nm2 = conf2[conf2.length - 1] // image name variable
                // --> region data query 
                db.query(`INSERT INTO table_calon (nama_calon, visi_misi, foto) VALUES ("${value[0]}", "${value[1]}", "${file_nm2}")`, (err, results) => {
                    if(err) throw err;
                    if(results.affectedRows > 0) {
                        req.flash('info', {
                                            type: true,
                                            text: "Data calon Berhasil ditambahkan"
                                          })
                        res.redirect('/admin')
                    } else {
                        req.flash('info', {
                                            type: false,
                                            text: "Data calon gagal ditambahkan"
                                           })
                        res.redirect('/add_calon')
                    }
                })
             } else {
                 req.flash('info', {
                             type: false,
                             text: "Data calon gagal ditambahkan"
                          })
                 res.redirect('/add_calon')   
             }
        })

    })

    // upload coblosan ke db
    app.get('/pilih/:calon/', (req, res) => {
        const username = req.session.username
        const id_calon = req.params.calon
        db.query(`INSERT INTO result (pemilih, calon) VALUES ("${username}", "${id_calon}")`, (err, results) => {
            if(err) throw err
            req.session.destroy()
            res.redirect('/')
        })
    })

    // hapus data calon
    app.get('/hapus/:id/:img', (req, res) => {
        const id = req.params.id
        const img = req.params.img

        db.query(`DELETE FROM table_calon WHERE id = ${id}`, (err, result) => {
            if(err) {
                req.flash('info', {
                        type: false,
                        text: "Data calon gagal dihapus"
                })
                res.redirect('/admin')
            }

            let img_cln = path.join(__dirname, "../../public/img/calon/") + img
            fs.unlink(img_cln) // hapus file calon
            req.flash('info', {
                        type: true,
                        text: "Data calon berhasil dihapus"
                      })
            res.redirect('/admin')

        })
    })

}

module.exports = send;