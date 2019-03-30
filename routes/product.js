const express = require('express');
const router = express.Router();
const axios = require('axios')
const app = express()
const product = require('../models/product')
router.get('/:id', async function (req, res) {
  try {
    const productInfo = await product.findOne('id', req.params.id)
    res.json({product: productInfo, status: 1})
  } catch (err) {
    console.error(err)
    res.json({status: 0})
  }
})
router.put('/:id', async function (req, res) {
  const {id} = req.params
  try {
    await product.update(id, req.body)
    res.json({status: 1})
  } catch (err) {
    console.error(err)
    res.json({status: 0})
  }
})
router.delete('/:id', async function (req, res) {
  const {id} = req.params
  try {
    await product.delete(id)
    res.json({status: 1})
  } catch (err) {
    console.error(err)
    res.json({status: 0})
  }
})
router.get('/:openid/list', async function (req, res) {
  let openid 
  if (req.params.openid !== 'myself') {
    openid = req.params.openid
  } else {
    openid = req.headers.openid
  }
  try {
    const products = await product.find(openid)
    res.json({products, status: 1})
  } catch (err) {
    console.error(err)
    res.json({status: 0})
  }
})
router.post('/create', async function (req, res) {
  const {openid} = req.headers
  const {name, price, desc = '', pic} = req.body
  try {
    await product.add({name, price, desc, pic, openid})
    res.json({status: 1})
  } catch (err) {
    console.error(err)
    res.json({status: 0})
  }
})
module.exports = router;