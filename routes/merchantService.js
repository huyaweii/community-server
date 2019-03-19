const express = require('express');
const router = express.Router();
const axios = require('axios')
const app = express()
const db = require('../utils/db')
const service = require('../models/service')
const shopkeeper = require('../models/shopkeeper')
const shopkeeperLike = require('../models/shopkeepeLike')

router.get('/', async function(req, res, next) {
  try {
    const services = await service.find()
    res.json({services, status: 1})
  } catch (err) {
    res.json({services: [], status: 0})
    throw err
  }
})

router.get('/:id/shopkeepers', async function(req, res, next) {
  const {openid} = req.headers
  try {
    const shopkeepers = await shopkeeper.find(req.params.id)
    for (const shopkeeper of shopkeepers) {
      const like = await shopkeeperLike.findOne(shopkeeper.id, openid)
      shopkeeper.isLike = Boolean(like)
    }
    res.json({shopkeepers, status: 1})
  } catch (err) {
    console.log(err)
    res.json({services: [], status: 0})
  }
})

router.post('/shopkeeper/:id/like', async function (req, res, next) {
  const {openid} = req.headers
  const shopkeeperId = req.params.id
  const data = await shopkeeperLike.findOne(shopkeeperId, openid)
  try {
    if (!data) {
      await shopkeeperLike.add({shopkeeper_id: shopkeeperId, openid})
    } else {
      await shopkeeperLike.delete(data.id)
    }
    const likeData = await db.asyncQuery('select count(1) as likeCount from shopkeeper_like where shopkeeper_id = ?', [shopkeeperId])
    const likeCount = likeData[0].likeCount
    await shopkeeper.update(shopkeeperId, {like_count: likeCount})
    res.json({status: 1}) 
  } catch (err) {
    console.log(err)
    res.json({status: 0})
  }
})

module.exports = router;
