const express = require('express');
const router = express.Router();
const axios = require('axios')
const app = express();
const merchantService = require('./merchantService');
const shopkeeper = require('./shopkeeper');
const product = require('./product')
const user = require('./user');
const five = require('./five');
const setOpenid = require('../middlewares/openid')
const qiniu = require("qiniu")

router.use(setOpenid)
router.use('/merchantService', merchantService)
router.use('/shopkeeper', shopkeeper)
router.use('/product', product)
router.use('/user', user)

router.use('/fives', five)

router.get('/uploadToken', async function(req, res, next) {
  const ak = 'xZxQTiyq-gMh-bTC-Ea4I4ps0bfWJR2Q5_ijaxh_'
  const sk = 'NbeJPPcmUg74uVNPVCKcOr831Lti-_MQ1tnRl_y2'
  const mac = new qiniu.auth.digest.Mac(ak, sk)
  const options = {
    scope: 'circle',
    expires: 7200
  }
  const putPolicy = new qiniu.rs.PutPolicy(options)
  const uploadToken = putPolicy.uploadToken(mac)
  res.json({ uploadToken, status: 1 })
})
module.exports = router;