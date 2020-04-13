const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser')
const db = require('./utils/db')
const session = require('express-session')
const flash = require('express-flash')
const send = require('./utils/send')

var sessionStorage = new session.MemoryStore
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(session({
    cookie: {maxAge: 60000},
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
    res.render('index', { data: req.flash('warning') })
})

// authentication controller
app.post('/auth', (req, res) => {
    const user = req.body.username
    const pass = req.body.password
    if(user && pass) {
        db.query(`SELECT * FROM user WHERE username = "${user}" AND password = "${pass}"`, (err, results) => {
            if(results === undefined || results.length == 0) {
                req.flash('warning', { type: 'error',
                                       message: 'Tidak ditemukan'});
                res.redirect('/');
            } else {
                if (results[0].level == "admin") {
                    req.session.loggedin = true
                    req.session.admin = true
                    res.redirect('/admin')
                } else {
                    req.session.loggedin = true;
                    req.session.username = user
                    res.redirect('/vote')
                } 
            }

        })
    } else {
        req.flash('warning', { type: 'error',
                               message: 'Mohon username & password diisi lengkap!'});
        res.redirect('/')
    }
})

// enter the vote web
app.get('/vote', (req, res) => {
    if(req.session.loggedin) {
        db.query("SELECT * FROM table_calon", (err, results) => {
            if(err) throw err;
            res.render('vote', {candidate: results , user:{username: "monitu12"}})
        })
    } else {
        req.flash('warning', { type: 'error',
                               message: 'Anda harus login terlebih dahulu!'});
        res.redirect('/')
    }
})

// detail calon 
app.get('/detail', (req, res) => {
    // if(req.session.loggedin) {
    // } else {
    //     req.flash('warning', { type: 'error',
    //     message: 'Anda harus login terlebih dahulu!'});
    //     res.redirect('/')
    // }
    res.render('detail')
})

// admin page 
app.get('/admin', (req, res) => {
    if(req.session.loggedin && req.session.admin) { 
        db.query("SELECT * FROM table_calon", (err, results) => {
            if(err) throw err;
            res.render('admin', { message: req.flash('info'), candite: results})
        })
    } else {
        req.flash('warning', { type: 'error',
                               message: 'Anda harus login terlebih dahulu!'});
        res.redirect('/')
    }
})

// add candidate page
app.get('/add_calon', (req, res) => {
    if(req.session.loggedin && req.session.admin) {
        res.render('add_calon')
    } else {
        req.flash('warning', { type: 'error',
                               message: 'Anda harus login terlebih dahulu!'});
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
app.listen(PORT, () => {
    console.log(`listen on port ${PORT} `)
})