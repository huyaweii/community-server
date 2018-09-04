var mysql = require('mysql')
exports.db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'community'
})
exports.jwtKey = 'community-hyw'