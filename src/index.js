const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser')
const db = require('./utils/db')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// template engine config
const hbs = require('hbs')
app.set('views', path.join(__dirname, "../views"))
app.set('view engine', 'hbs')
app.use(express.static(path.join(__dirname, "../public")))

// welcome website
app.get('/', (req, res) => {
    res.render('index')
})

app.post('/auth', (req, res) => {
    const user = req.body.username
    const pass = req.body.password
    if(user && pass) {
        db.query(`SELECT * FROM user WHERE username = "${user}" AND password = "${pass}"`, (err, results) => {
            if(err) {
                res.redirect('/')
            };
            res.send(results)
        })
    } else {
        res.redirect('/')
    }
})

// enter the vote web
app.get('/vote', (req, res) => {
    res.render('vote')
})

// detail calon 
app.get('/detail', (req, res) => {
    res.render('detail')
})

// admin page 
app.get('/admin', (req, res) => {
    res.render('admin')
})

// add candidate page
app.get('/add_calon', (req, res) => {
    res.render('add_calon')
})

// destroy session and logout from website
app.get('/logout', (req, res) => {

})

app.get('*', (req, res) => {
    res.send(`<h3 style="text-align: center; margin-top: 70px; font-family: 'Roboto'; font-size: 22px;"> NOT FOUND 404 </h3>`)
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`listen on port ${PORT} `)
})