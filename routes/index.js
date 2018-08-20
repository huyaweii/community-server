var express = require('express');
var router = express.Router();
const axios = require('axios')
var app = express();
var db = require('../config')
var moment = require('moment')
moment.locale('zh-cn')
//get请求
/* GET home page. */
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
      if (queryRes.length === 0) {
        const insertSql = `insert into user (open_id, avatar, name, gender) values (?, ?, ?, ?)`
        db.query(insertSql, [openid, avatar, name, gender], function(err, addResult) {
          res.json({...result.data, status: 1})
        })
      } else {
        const updateSql = `update user set avatar=?, name=?, gender=? where open_id=?`
        db.query(updateSql, [avatar, name, Number(gender), openid], function(err, updateResult) {
          res.json({...result.data, status: 1})
        })
      }
    })
  } catch (err) {
    res.send(err)
  }
})
router.post('/publish_post', async function (req, res, next) {
  const sql = `insert into post (content, category_id, open_id, create_time, type) values (?, ?, ?, ?, ?)`
  const {content, category_id, openid, type} = req.body
  const creatTime = moment().format('YYYY-MM-DD HH:mm:ss')
  db.query(sql, [content, category_id, openid, creatTime, type], function(err, result) {
    res.json({status: 1})
  })
})

router.get('/home', async function(req, res, next) {
  const {postPage, pageSize} = req.query
  const start = postPage * pageSize
  const end = (postPage + 1) * pageSize
  const count = await new Promise(function (resolve, reject) {
    const sql = `select count(*) as c from post`
    db.query(sql, [], function(err, result) {
      resolve(result)
    })
  })

  const postList = await new Promise(function (resolve, reject) {
    const sql = "select * from post  where type = 'community' order by create_time desc limit ?, ?"
    db.query(sql, [start, end], function(err, result) {
      console.log(result, err)
      resolve(result)
    })
  })
  for (post of postList) {
    let sql = `select * from category where id = ? `
    const category = await new Promise(function(resolve, reject) {
      db.query(sql, [post.category_id], function(err, result) {
        resolve(result)
      })
    })
    post.categoryName = category[0].name
    sql = `select * from reply where post_id = ?`
    const replys = await new Promise(function(resolve, reject) {
      db.query(sql, [post.id], function(err, result) {
        resolve(result)
      })
    })
    sql = `select * from user where open_id = ?`
    post.replys = replys
    for (reply of replys) {
      const user = await new Promise(function(resolve, reject) {
        db.query(sql, [reply.user_id], function(err, result) {
          resolve(result)
        })
      })
      reply.user = {
        name: user[0].name,
        id: user[0].open_id
      }
      if (reply.at_user_id) {
        const atUser = await new Promise(function(resolve, reject) {
          db.query(sql, [reply.at_user_id], function(err, result) {
            resolve(result)
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
        resolve(result)
      })
    })
    post.create_time = moment(post.create_time).fromNow()
    post.user = {
      name: user[0].name,
      avatar: user[0].avatar
    }

  }
  res.json({count: count[0].c, postList, status: 1})
})

router.get('/posts', async function (req, res) {
  const {postPage, pageSize, postId, type} = req.query
  const start = postPage * pageSize
  const end = (postPage + 1) * pageSize
  const postList = await new Promise(function (resolve, reject) {
    let sql
    if (postId) {
      sql = `select * from post where id < ?, type = ? order by create_time desc limit ?, ? `
      db.query(sql, [postId, type, 
        start, end], function(err, result) {
        resolve(result)
      })  
    } else {
      sql = `select * from post where type = ? order by create_time desc limit ?, ?`
      db.query(sql, [type, start, end], function(err, result) {
        resolve(result)
      })  
    }
  })
  for (post of postList) {
    let sql
    if (type === 'community') {
      sql = `select * from category where id = ? `
      const category = await new Promise(function(resolve, reject) {
        db.query(sql, [post.category_id], function(err, result) {
          resolve(result)
        })
      })
      post.categoryName = category[0].name
    }
    sql = `select * from reply where post_id = ?`
    const replys = await new Promise(function(resolve, reject) {
      db.query(sql, [post.id], function(err, result) {
        resolve(result)
      })
    })
    sql = `select * from user where open_id = ?`
    post.replys = replys
    for (reply of replys) {
      const user = await new Promise(function(resolve, reject) {
        db.query(sql, [reply.user_id], function(err, result) {
          resolve(result)
        })
      })
      reply.user = {
        name: user[0].name,
        id: user[0].open_id
      }
      if (reply.at_user_id) {
        const atUser = await new Promise(function(resolve, reject) {
          db.query(sql, [reply.at_user_id], function(err, result) {
            resolve(result)
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
        resolve(result)
      })
    })
    post.create_time = moment(post.create_time).fromNow()
    post.user = {
      name: user[0].name,
      avatar: user[0].avatar
    }
  }
  res.json({postList, status: 1})
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
  const sql = `update user where set avatar=?, name=?, gender=? where open_id=?`
  const {avatar, name, gender, openid} = req.body
  const result = await new Promise(function (resolve, reject) {
    db.query(sql, [avatar, name, gender, openid], function(err, result) {
      resolve(result)
    })
  })
  res.json({status: 1})
})

router.post('/reply_post', async function (req, res, next) {
  let sql = `insert into reply (content, post_id, user_id, at_user_id) values (?, ?, ?, ?)`
  const {content, at_user_id, post_id, openid} = req.body
  await new Promise(function (resolve, reject) {
    db.query(sql, [content, post_id, openid, at_user_id], function(err, result) {
      resolve(result)
    })
  })
  sql = `select * from user where open_id = ?`
  const user = await new Promise(function(resolve, reject) {
    db.query(sql, [openid], function(err, result) {
      resolve(result)
    })
  })
  const reply = {
    content,
    post_id,
    at_user_id,
    user_id: openid,
    user: {
      id: user[0].open_id,
      name: user[0].name
    }
  }
  if (at_user_id) {
    const atUser = await new Promise(function(resolve, reject) {
      db.query(sql, [at_user_id], function(err, result) {
        resolve(result)
      })
    })
    reply.at_user = {
      name: atUser[0].name,
      id: atUser[0].open_id
    }
  }
  res.json({reply, status: 1})
})
module.exports = router;
