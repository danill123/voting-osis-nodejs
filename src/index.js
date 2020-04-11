const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser')
const db = require('./utils/db')
const session = require('express-session')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
}))

// template engine config
const hbs = require('hbs')
app.set('views', path.join(__dirname, "../views"))
app.set('view engine', 'hbs')
app.use(express.static(path.join(__dirname, "../public")))

// welcome website
app.get('/', (req, res) => {
    res.render('index')
})

// authentication controller
app.post('/auth', (req, res) => {
    const user = req.body.username
    const pass = req.body.password
    if(user && pass) {
        db.query(`SELECT * FROM user WHERE username = "${user}" AND password = "${pass}"`, (err, results) => {
            if(err) res.redirect('/');

            if(results[0].level == "admin") {
                req.session.loggedin = true
                req.session.admin = true
                res.redirect('/admin')
            } else {
                req.session.loggedin = true;
                req.session.username = pass
                res.redirect('/vote')
            } 

        })
    } else {
        res.redirect('/')
    }
})

// enter the vote web
app.get('/vote', (req, res) => {
    if(req.session.loggedin) {
        res.render('vote')
    } else {
        res.redirect('/')
    }
})

// detail calon 
app.get('/detail', (req, res) => {
    res.render('detail')
})

// admin page 
app.get('/admin', (req, res) => {

    if(req.session.loggedin && req.session.admin) {
        res.render('admin')
    } else {
        res.redirect('/')
    }

})

// add candidate page
app.get('/add_calon', (req, res) => {
    res.render('add_calon')
})

// destroy session and logout from website
app.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/')
})

app.get('*', (req, res) => {
    res.send(`<h3 style="text-align: center; margin-top: 70px; font-family: 'Roboto'; font-size: 22px;"> NOT FOUND 404 </h3>`)
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`listen on port ${PORT} `)
})