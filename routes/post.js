const express = require('express');
const router = express.Router();
const axios = require('axios')
const app = express();
const jwt = require('jwt-simple')
const moment = require('moment')
const post = require('../models/post')
const comment = require('../models/comment')
const reply = require('../models/reply')
const user = require('../models/user')
const postPic = require('../models/postPic')
const {db, jwtKey} = require('../config')

router.get('/', async function(req, res) {
  const {page, pageSize} = req.query
  try {
    const postList = await post.find(page, pageSize)
    for (const postInfo of postList) {
      postInfo.user = await user.findOne('openid', postInfo.create_by)
      const images = await postPic.find(postInfo.id)
      postInfo.images = images.map(image => image.url)
      postInfo.create_time = moment(postInfo.create_time).format('MM-DD HH:mm:ss')
      const countData = await db.asyncQuery('select count(1) as commentCount from comment where post_id = ?', [postInfo.id])
      postInfo.commentCount = countData[0].commentCount
    }
    res.json({status: 1, postList})    
  } catch (error) {
    res.json({status: 0})
    throw error    
  }
})


router.get('/:id', async function(req, res) {
  const {id} = req.params
  try {
    const postInfo = await post.findOne('id', id)
    postInfo.user = await user.findOne('openid', postInfo.create_by)
    const images = await postPic.find(postInfo.id)
    postInfo.images = images.map(image => image.url)
    postInfo.create_time = moment(postInfo.create_time).format('MM-DD HH:mm:ss')
    res.json({status: 1, post: postInfo})    
  } catch (error) {
    res.json({status: 0})
    throw error    
  }
})

router.post('/create', async function(req, res, next) {
  const {openid} = req.headers
  const {content, tab, images} = req.body
  try {
    const result= await post.add({create_by: openid, content, tab, create_time: moment().format('YYYY-MM-DD HH:mm:ss')})
    const postId = result.insertId
    for (const image of images) {
      postPic.add({post_id: postId, url: image})
    }
    res.json({status: 1}) 
  } catch (err) {
    res.json({status: 0})
    throw err
  }
})
router.get('/:id/comment', async function(req, res, next) {
  const {id} = req.params
  try {
    const comments = await comment.find(id)
    for (const comment of comments) {
      const {avatar_url, nick_name} = await user.findOne('openid', comment.create_by)
      comment.user = {avatar_url, nick_name}
      if (comment.at_user_id) {
        const {nick_name} = await user.findOne('openid', comment.create_by)
      comment.at_user_name = nick_name
      }
    }
    res.json({status: 1, comments}) 
  } catch (err) {
    res.json({status: 0}) 
    throw err
  }
})

router.post('/:id/comment', async function(req, res, next) {
  const {id} = req.params
  const {openid} = req.headers
  const {content, atUserId} = req.body
  const data = {
    post_id: id, 
    create_by: openid, 
    content, 
    at_user_id: atUserId,
    create_time: moment().format('YYYY-MM-DD HH:mm:ss')
  }
  try {
    const result = await comment.add(data)
    const {avatar_url, nick_name} = await user.findOne('openid', openid)
    res.json({status: 1, comment: {...data, id: result.insertId, user: {avatar_url, nick_name}}}) 
  } catch (err) {
    res.json({status: 0}) 
    throw err
  }
})

router.post('/:id/reply', async function(req, res, next) {
  const {id} = req.params
  const {openid} = req.headers
  const {atUserOpenid, content} = req.body
  try {
    await reply.add({
      parend_id: id, 
      create_by: openid, 
      at_user_openid: atUserOpenid, 
      content, 
      create_time: moment().format('YYYY-MM-DD HH:mm:ss')
    })
    res.json({status: 1}) 
  } catch (err) {
    res.json({status: 1}) 
    throw err
  }
})

module.exports = router;
