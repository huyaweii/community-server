var express = require('express');
var router = express.Router();
const axios = require('axios')
var app = express();
var jwt = require('jwt-simple')
var qiniu = require("qiniu")
var {db, jwtKey} = require('../config')
const log = require('../config/log')
var moment = require('moment')
moment.locale('zh-cn')
//get请求
// var client = require('redis').createClient();

// client.set("name", "xixihaha");

// client.on('error', function (err) {
//   console.log('Error ' + err);
// })

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', async function (req, res, next) {
  try {
    const result = await axios.get(`https://api.weixin.qq.com/sns/jscode2session?appid=wx3683e9d056495ca8&secret=37e30f36192a20b4c88920325122e43f&js_code=${req.query.code}&grant_type=authorization_code`)
    const {openid} = result.data
    const {avatar, name, gender} = req.query
    const sql = `select * from user where open_id = ?`
    db.query(sql, [result.data.openid], function(err, queryRes) {
      const token = jwt.encode(
        {
          openid: result.data.openid
        },
        jwtKey
      )
      res.json({token, status: 1})
      // if (queryRes.length === 0) {
      //   const insertSql = `insert into user (open_id, avatar, name, gender) values (?, ?, ?, ?)`
      //   db.query(insertSql, [openid, avatar, name, gender], function(err, addResult) {
      //     res.json({...result.data, token, status: 1})
      //   })
      // } else {
      //   const updateSql = `update user set avatar=?, name=?, gender=? where open_id=?`
      //   db.query(updateSql, [avatar, name, Number(gender), openid], function(err, updateResult) {
      //     res.json({...result.data, token, status: 1})
      //   })
      // }
    })
  } catch (err) {
    res.send(err)
  }
})

router.get('/sync_userInfo', async function (req, res, next) {
  try {
    let openid = jwt.decode(req.headers.token, jwtKey).openid
    const {avatar, name, gender} = req.query
    const sql = `select * from user where open_id = ?`
    db.query(sql, ['oKwjT5PaQctPt__T6L5OPxbg_K-Y'], function(err, queryRes) {
      if (queryRes.length === 0) {
        const insertSql = `insert into user (open_id, avatar, name, gender) values (?, ?, ?, ?)`
        db.query(insertSql, [openid, avatar, name, gender], function(err, addResult) {
          res.json({status: 1})
        })
      } else {
        const updateSql = `update user set avatar=?, name=?, gender=? where open_id=?`
        db.query(updateSql, [avatar, name, Number(gender), openid], function(err, updateResult) {
          res.json({status: 1})
        })
      }
    })
  } catch (err) {
    res.send(err)
  }
})


router.get('/home', async function(req, res, next) {
  try {
    const {postPage, pageSize} = req.query
    const start = postPage * pageSize
    const end = (postPage + 1) * pageSize
    const count = await new Promise(function (resolve, reject) {
      const sql = `select count(*) as c from post where type = 'community'`
      db.query(sql, [], function(err, result) {
        if (!err) {
          resolve(result)
        } else {
          reject(err)
        }
      })
    })
  
    let postList = await new Promise(function (resolve, reject) {
      const sql = "select * from post where type = 'community' order by create_time desc limit ?, ?"
      db.query(sql, [start, end], function(err, result) {
        if (!err) {
          resolve(result)
        } else {
          reject(err)
        }
      })
    })
    postList = postList || []
    for (const post of postList) {
      let sql = `select * from category where id = ? `
      const category = await new Promise(function(resolve, reject) {
        db.query(sql, [post.category_id], function(err, result) {
          if (!err) {
            resolve(result)
          } else {
            reject(err)
          }
        })
      })
      // post.categoryName = category[0].name
      post.categoryName = category[0].name
      sql = `select * from reply where post_id = ?`
      const replys = await new Promise(function(resolve, reject) {
        db.query(sql, [post.id], function(err, result) {
          if (!err) {
            resolve(result)
          } else {
            reject(err)
          }
        })
      })
      sql = `select * from user where open_id = ?`
      post.replys = replys
      for (reply of replys) {
        const user = await new Promise(function(resolve, reject) {
          db.query(sql, [reply.user_id], function(err, result) {
            if (!err) {
              resolve(result)
            } else {
              reject(err)
            }
          })
        })
        reply.user = {
          name: user[0].name,
          id: user[0].open_id
        }
        if (reply.at_user_id) {
          const atUser = await new Promise(function(resolve, reject) {
            db.query(sql, [reply.at_user_id], function(err, result) {
              if (!err) {
                resolve(result)
              } else {
                reject(err)
              }
            })
          })
          reply.at_user = {
            name: atUser[0].name,
            id: atUser[0].open_id
          }
        }
      }
      const user = await new Promise(function(resolve, reject) {
        db.query(sql, [post.open_id], function(err, result) {
          if (!err) {
            resolve(result)
          } else {
            reject(err)
          }
        })
      })
      post.create_time = moment(post.create_time).fromNow()
      post.user = {
        name: user[0].name,
        avatar: user[0].avatar
      }
      sql = `select pic_url from post_pic where post_id = ?`
      const images = await new Promise(function(resolve, reject) {
        db.query(sql, [post.id], function(err, result) {
          if (!err) {
            resolve(result)
          } else {
            reject(err)
          }
        })
      })
      post.images = images.map(image => image.pic_url)
    }
    res.json({count: count[0].c, postList, status: 1})
  } catch(err) {
    log.e(err)
    throw '获取信息失败'
    res.json({message: '获取信息失败', postList: [], status: 0})
  }  
})

router.get('/category_list', async function(req, res, next) {
  const categoryList = await new Promise(function (resolve, reject) {
    const sql = `select * from category`
    db.query(sql, [], function(err, result) {
      resolve(result)
    })
  })
  res.json({categoryList, status: 1})
})

router.post('/update_user', async function (req, res, next) {
  const sql = `update user set avatar=?, name=?, gender=? where open_id=?`
  let openid = jwt.decode(req.headers.token, jwtKey).openid
  const {avatar, name, gender} = req.body
  const result = await new Promise(function (resolve, reject) {
    db.query(sql, [avatar, name, gender, openid], function(err, result) {
      resolve(result)
    })
  })
  res.json({status: 1})
})

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

router.post('/suggestion', async function(req, res, next) {
  const {content} = req.body
  let sql = 'insert into suggestion (content) values (?)'
  try {
    await new Promise(function (resolve, reject) {
      db.query(sql, [content], function(err, result) {
        resolve(result)
      })
    })
    res.json({status: 1})
  } catch (err) {
    res.json({status: 0})
  }
})
module.exports = router;
