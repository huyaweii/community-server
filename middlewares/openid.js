const jwt = require('jwt-simple')
const {jwtKey} = require('../config')
function setOpenid (req, res, next) {
  if (req.headers.token) {
    const openid = jwt.decode(req.headers.token, jwtKey).openid
    req.headers.openid = openid
  }
  next()
}
module.exports = setOpenid;

