const express = require('express');
const router = express.Router();
const axios = require('axios')
const app = express()
const five = require('../models/five')

router.get('/list', async function (req, res) {
  try {
    const fiveList = await five.find()
    res.header("Access-Control-Allow-Origin", "*");
    res.json({fiveList, status: 1})  
  } catch (err) {
    console.error(err)
    res.json({status: 0})
  }
})

router.post('/create', async function (req, res) {
  const {title, desc, price, image} = req.body
  try {
    await five.add({title, desc, price, image})
    res.json({status: 1})  
  } catch (err) {
    console.error(err)
    res.json({status: 0})
  }
})

module.exports = router;