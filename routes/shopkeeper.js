const express = require('express');
const router = express.Router();
const axios = require('axios')
const app = express()
const shopkeeper = require('../models/shopkeeper')
const shopkeeperLike = require('../models/shopkeeperLike')

router.get('/myself', async function (req, res) {
  const {openid} = req.headers
  try {
    const shopkeeperRes = await shopkeeper.findOne('openid', openid)
    res.json({shopkeeper: shopkeeperRes, status: 1})  
  } catch (err) {
    console.error(err)
    res.json({status: 0})
  }
})

router.get('/myself/like', async function (req, res) {
  const {openid} = req.headers
  const {page, pageSize} = req.query
  try {
    const shopkeepersLike = await shopkeeperLike.find(openid, page, pageSize)
    const shopkeepers = []
    for (const like of shopkeepersLike) {
      const keeper = await shopkeeper.findOne('id', like.shopkeeper_id)
      shopkeepers.push(keeper)
    }
    res.json({shopkeepers, status: 1})  
  } catch (err) {
    console.error(err)
    res.json({status: 0})
  }
})

router.post('/create', async function (req, res) {
  const {openid} = req.headers
  const data = req.body
  data.openid = openid
  try {
    await shopkeeper.add(data)
    res.json({status: 1})
  } catch (err) {
    console.error(err)
    res.json({status: 0})
  }
})
module.exports = router;