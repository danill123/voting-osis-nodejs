const express = require('express')
const app = express()
const http = require('http').Server(app);
const io = require('socket.io')(http)
const path = require('path')
const bodyParser = require('body-parser')
const db = require('./utils/db')
const session = require('express-session')
const flash = require('express-flash')
const compression = require('compression')
const send = require('./utils/send')
const sockt = require('./utils/sockt')


app.use(compression()) // compress all request GET

var sessionStorage = new session.MemoryStore
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(session({
    cookie: {maxAge: 60000 * (60 * 48)},
    store: sessionStorage, 
    secret: "secret",
    resave: true,
    saveUninitialized: true
}))
app.use(flash())

// template engine config
const hbs = require('hbs')
app.set('views', path.join(__dirname, "../views"))
app.set('view engine', 'hbs')
app.use(express.static(path.join(__dirname, "../public")))

// welcome website
app.get('/', (req, res) => {
    res.render('index', {message: req.flash('warning')})
})

// authentication controller
app.post('/auth', (req, res) => {
    const user = req.body.username
    const pass = req.body.password
    if(user && pass) {
        db.query(`SELECT * FROM user WHERE username = "${user}" AND password = "${pass}"`, (err, results) => {
            if(results === undefined || results.length == 0) {
                req.flash('warning', { type: 'danger',
                                       text: 'Tidak ditemukan'});
                res.redirect('/');
            } else {
                if (results[0].level == "admin") {
                    req.session.loggedin = true
                    req.session.admin = true
                    res.redirect('/admin')
                } else {
                    // verifikasi apakah user telah memilih
                    db.query(`SELECT * FROM result WHERE pemilih = "${user}"`, (err, results) => {
                        if(err) throw err;
                        if(results === undefined || results.length == 0){
                            req.session.loggedin = true;
                            req.session.username = user
                            res.redirect('/vote')
                        } else {
                            req.flash('warning', {type: 'warning',
                                    text: 'Maaf anda sudah memilih'})
                            res.redirect('/');
                        }
                    })
                } 
            }
        })
    } else {
        req.flash('warning', { type: 'danger',
                               text: 'Mohon username & password diisi lengkap!'});
        res.redirect('/')
    }
})

// enter the vote web
app.get('/vote', (req, res) => {
    if(req.session.loggedin) {
        db.query("SELECT * FROM table_calon", (err, results) => {
            if(err) throw err;
            res.render('vote', {candidate: results})
        })
    } else {
        req.flash('warning', { type: 'danger',
                               text: 'Anda harus login terlebih dahulu!'});
        res.redirect('/')
    }
})

// thank page 
app.get('/thanks', (req, res) => {
    res.render('thanks')
})

// detail calon 
app.get('/detail/:id', (req, res) => {
    if(req.session.loggedin) {
        db.query(`SELECT * FROM table_calon WHERE id = ${req.params.id}`, (err, results) => {
            if(err) throw err;  
            res.render('detail', results[0])
        })
    } else {
        req.flash('warning', { type: 'danger',
                   text: 'Anda harus login terlebih dahulu!'});
        res.redirect('/')
    }
})

// admin page 
app.get('/admin', (req, res) => {
    if(req.session.loggedin && req.session.admin) { 
        // socket.io features & ability just for admin
        sockt(io)

        db.query("SELECT * FROM table_calon", (err, results) => {
            if(err) throw err;
            res.render('admin', { message: req.flash('info'), candite: results})
        })
    } else {
        req.flash('warning', { type: 'danger',
                               text: 'Anda harus login terlebih dahulu!'});
        res.redirect('/')
    }
})

// view edit data calon
app.get('/edit/:id', (req, res) => {
    const id = req.params.id
    db.query(`SELECT * FROM table_calon WHERE id = ${id}`, (err, results) => {
        res.render('edit', {message: results})
    })
})

// add candidate page
app.get('/add_calon', (req, res) => {
    if(req.session.loggedin && req.session.admin) {
        res.render('add_calon')
    } else {
        req.flash('warning', { type: 'danger',
                               text: 'Anda harus login terlebih dahulu!'});
        res.redirect('/')
    } 
})

// destroy session and logout from website
app.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/')
})

// function for upload handler
send(app)

app.get('*', (req, res) => {
    res.send(`<h3 style="text-align: center; margin-top: 70px; font-family: 'Roboto'; font-size: 22px;"> NOT FOUND 404 </h3>`)
})

const PORT = process.env.PORT || 3000
http.listen(PORT, () => {
    console.log(`listen on port ${PORT} `)
})