const db = require('./db')
const formidable = require('formidable')
const path = require('path')
const fs = require('fs')

const send = (app) => {
    // upload data & gambar calon
    app.post('/up_calon/:calon/:visi', (req, res) => {
        // decode base64 nama calon
        const text = decd_64(req.params.calon)
        // decode base64 visi-misi
        const val = decd_64(req.params.visi)
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
                let file_nm = pars_pth(file.files.path).toString()
                fs.unlink(del_pth(file_nm)) // delete hash file

                // initialization variable for image name
                let file_nm2 = pars_pth(file.foto.path) // image name variable
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

    // upload edit data calon
    app.post('/edit/:calon/:visi/:id/:old_img', (req, res) => {
        // initialization request parameter 
        const cal = decd_64(req.params.calon).toString()
        const vs = decd_64(req.params.visi).toString()
        const id = req.params.id
        const old_img = req.params.old_img

        // initialization upload file for change data
        const form2 = new formidable.IncomingForm();
        form2.multiples = true
        form2.uploadDir = path.join(__dirname, "../../public/img/calon")
        form2.keepExtensions = true
        form2.hash = true
        form2.parse(req, (err, fields, file) => {
            // jika tanpa upload foto baru
            if(file.foto.type !== "image/png") {
                let init3 = pars_pth(file.files.path).toString()
                fs.unlink(del_pth(init3)) // delete hash file

                let init4 = pars_pth(file.foto.path).toString()
                fs.unlink(del_pth(init4)) // delete hash file

                db.query(`UPDATE table_calon SET nama_calon = "${cal}", visi_misi = "${vs}", foto = "${old_img}" WHERE table_calon.id = ${id}`, (err, results) => {
                    if(!err) {
                        req.flash('info', {
                                   type: true,
                                   text: "Data calon berhasil di ubah"
                                 })
                        res.redirect('/admin')
                    } else {
                        req.flash('info', {
                            type: false,
                            text: "Data calon gagal diubah"
                         })
                        res.redirect('/admin')
                    }
                })

            } else { 
                // jika dengan foto baru
                let im = pars_pth(file.foto.path).toString()
                let hsh = pars_pth(file.files.path).toString()
                fs.unlink(del_pth(hsh)) // delete hash file
                fs.unlink(path.join(__dirname, "../../public/img/calon/") + old_img) 
                db.query(`UPDATE table_calon SET nama_calon = "${cal}" , visi_misi = "${vs}" , foto = "${im}" WHERE table_calon.id = ${id}`, (err, results) => {
                    if(!err) {
                        req.flash('info', {
                                   type: true,
                                   text: "Data calon berhasil di ubah"
                                 })
                        res.redirect('/admin')
                    } else {
                        req.flash('info', {
                            type: false,
                            text: "Data calon gagal diubah"
                         })
                        res.redirect('/admin')
                    }
                })
            }

        })

    })

    // upload coblosan ke db
    app.get('/pilih/:calon/', (req, res) => {
        if(req.session.loggedin) {
            const username = req.session.username
            const id_calon = req.params.calon
            db.query(`INSERT INTO result (pemilih, calon) VALUES ("${username}", "${id_calon}")`, (err, results) => {
                if(err){
                     throw err;
                } else {
                    req.session.destroy()
                    res.redirect('/thanks')
                }
            })
        } else {
            req.flash('warning', { type: 'danger',
                   text: 'Anda harus login terlebih dahulu!'});
            res.redirect('/')
        }
        
    })

    // hapus data calon
    app.get('/hapus/:id/:img', (req, res) => {
        if(req.session.loggedin && req.session.admin) {
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
    
                fs.unlink(del_pth(img)) // hapus file calon
                req.flash('info', {
                            type: true,
                            text: "Data calon berhasil dihapus"
                          })
                res.redirect('/admin')
    
            })
        } else {
            req.flash('warning', { type: 'danger',
                               text: 'Anda harus login terlebih dahulu!'});
            res.redirect('/')
        }
    })

}

// function for decode base64
const decd_64 = (data) => {
    const bfr = new Buffer(data, 'base64')
    return bfr.toString('ascii')
}

// function for parse path 
const pars_pth = (data) => {
    const prs = data.split("/")
    return prs[prs.length - 1]
}

// function for delete path
const del_pth = (data) => {
    let dir = path.join(__dirname, "../../public/img/calon/") + data
    return dir.toString()
}

module.exports = send;