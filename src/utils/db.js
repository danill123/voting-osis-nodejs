// mysql db config
const mysql = require('mysql')

const db = mysql.createConnection({
    host:'localhost',
    user:'root',
    password: '',
    database: 'VOTING_OSIS'
})

module.exports = db


