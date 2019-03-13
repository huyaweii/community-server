const express = require('express');
const router = express.Router();
const axios = require('axios')
const app = express();
const moment = require('moment')
const service = require('../models/service')
const shopkeeper = require('../models/shopkeeper')
moment.locale('zh-cn')
const jwt = require('jwt-simple')
const {db, jwtKey} = require('../config')  

router.get('/', async function(req, res, next) {
  let sql = 'select * from service'
  try {
    const services = await service.find()
    res.json({services, status: 1})
  } catch (err) {
    res.json({services: [], status: 0})
    throw err
  }
})
router.get('/:id/shopkeepers', async function(req, res, next) {
  try {
    const shopkeepers = await shopkeeper.find(req.params.id)
    res.json({shopkeepers, status: 1})
  } catch (err) {
    res.json({services: [], status: 0})
    throw err
  }
})

module.exports = router;
