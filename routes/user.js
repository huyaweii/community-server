const express = require('express');
const router = express.Router();
const axios = require('axios')
const app = express();
const jwt = require('jwt-simple')
const user = require('../models/user')
const {db, jwtKey} = require('../config')

router.get('/login', async function(req, res, next) {
  try {
    const result = await axios.get(`https://api.weixin.qq.com/sns/jscode2session?appid=wx3683e9d056495ca8&secret=37e30f36192a20b4c88920325122e43f&js_code=${req.query.code}&grant_type=authorization_code`)
    const {openid} = result.data
    const token = jwt.encode(
      {
        openid
      },
      jwtKey
    )
    res.json({token, status: 1}) 
  } catch (err) {
    res.json({status: 0})
    throw err
  }
})

router.post('/create', async function(req, res, next) {
  const {openid} = req.headers
  const {nickName, avatarUrl} = req.body
  try {
    const userInfo = await user.findOne('openid', openid)
    if (userInfo) {
      await user.update(openid, {nick_name: nickName, avatar_url: avatarUrl})
    } else {
      await user.add({openid, nick_name: nickName, avatar_url: avatarUrl})
    }
    res.json({status: 1}) 
  } catch (err) {
    res.json({status: 0})
    throw err
  }
})

module.exports = router;
