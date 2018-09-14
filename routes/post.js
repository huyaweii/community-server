var express = require('express');
var router = express.Router();
const axios = require('axios')
var app = express();
var moment = require('moment')
moment.locale('zh-cn')
var jwt = require('jwt-simple')
var {db, jwtKey} = require('../config')

// 帖子列表
router.get('/', async function(req, res, next) {
  try {
    let {postPage, pageSize, postId, type = 'community', categoryId} = req.query
    let openid = jwt.decode(req.headers.token, jwtKey).openid
    postPage = Number(postPage)
    pageSize = Number(pageSize)
    categoryId = categoryId && Number(categoryId)
    const start = postPage * pageSize
    const end = (postPage + 1) * pageSize
    const postList = await new Promise(function (resolve, reject) {
      let sql
      if (postId) {
        sql = categoryId 
          ? `select * from post where id < ? and type = ? and category_id = ${categoryId} order by create_time desc limit ?, ? `
          : `select * from post where id < ? and type = ? order by create_time desc limit ?, ? `
        db.query(sql, [postId, type, 
          start, end], function(err, result) {
          if (!err) {
            resolve(result)
          } else {
            reject(err)
          }
        })  
      } else {
        sql = categoryId ? `select * from post where type = ? and category_id = ${categoryId} order by create_time desc limit ?, ?`
         : `select * from post where type = ? order by create_time desc limit ?, ?`
        db.query(sql, [type, start, end], function(err, result) {
          if (!err) {
            resolve(result)
          } else {
            reject(err)
          }
        })  
      }
    })
    for (const post of postList) {
      let sql
      if (type === 'community') {
        sql = `select * from category where id = ? `
        const category = await new Promise(function(resolve, reject) {
          db.query(sql, [post.category_id], function(err, result) {
            if (!err) {
              resolve(result)          
            } else {
              reject(err)
            }
          })
        })
        post.categoryName = category[0].name
      }
      if (type === 'nearby' || type === 'anonymity') {
        sql = 'select * from praise where open_id = ? and praise_at_id = ?'
        const praise = await new Promise(function(resolve, reject) {
          db.query(sql, [openid, post.id], function(err, result) {
            if (!err) {
              resolve(result)
            } else {
              reject(err)
            }
          })
        })
        post.isPraised = praise.length > 0 && praise[0].status
        sql = 'select count(*) as c from praise where praise_at_id = ? and status = 1'
        const count = await new Promise(function(resolve, reject) {
          db.query(sql, [post.id], function(err, result) {
            if (!err) {
              resolve(result)
            } else {
              reject(err)
            }
          })
        })
        post.praiseCount = count[0].c
      }
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
    let count
    if (postPage === 0) {
      sql = 'select count(*) as c from post where type = ?'
      const count = await new Promise(function(resolve, reject) {
        db.query(sql, [type], function(err, result) {
          if (!err) {
            resolve(result)
          } else {
            reject(err)
          }
        })
      })
      return res.json({count: count[0].c, postList, status: 1})
    }
    res.json({postList, status: 1})
  } catch(err) {
    res.json({message: '获取列表失败', status: 0})
    throw err
  }  
})

// 发布者帖子列表
router.get('/user/:id', async function(req, res, next) {
  try {
    let {postPage, pageSize, postId, type = 'community'} = req.query
    let openid = jwt.decode(req.headers.token, jwtKey).openid
    postPage = Number(postPage)
    pageSize = Number(pageSize)
    const start = postPage * pageSize
    const end = (postPage + 1) * pageSize
    const postList = await new Promise(function (resolve, reject) {
      let sql
      if (postId) {
        sql = `select * from post where id < ? and type = ? and open_id = ? order by create_time desc limit ?, ? `
        db.query(sql, [postId, type, openid,
          start, end], function(err, result) {
          if (!err) {
            resolve(result)
          } else {
            reject(err)
          }
        })  
      } else {
        sql = `select * from post where type = ? and open_id = ? order by create_time desc limit ?, ?`
        db.query(sql, [type, openid, start, end], function(err, result) {
          if (!err) {
            resolve(result)
          } else {
            reject(err)
          }
        })  
      }
    })
    for (const post of postList) {
      let sql
      if (type === 'community') {
        sql = `select * from category where id = ? `
        const category = await new Promise(function(resolve, reject) {
          db.query(sql, [post.category_id], function(err, result) {
            if (!err) {
              resolve(result)          
            } else {
              reject(err)
            }
          })
        })
        post.categoryName = category[0].name
      }
      if (type === 'nearby' || type === 'anonymity') {
        sql = "select * from praise where open_id = ? and praise_at_id = ? and type = 'post'"
        const praise = await new Promise(function(resolve, reject) {
          db.query(sql, [openid, post.id], function(err, result) {
            if (!err) {
              resolve(result)
            } else {
              reject(err)
            }
          })
        })
        post.isPraised = praise.length > 0 && praise[0].status
        sql = 'select count(*) as c from praise where praise_at_id = ? and status = 1'
        const count = await new Promise(function(resolve, reject) {
          db.query(sql, [post.id], function(err, result) {
            if (!err) {
              resolve(result)
            } else {
              reject(err)
            }
          })
        })
        post.praiseCount = count[0].c
      }
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
      sql = `select * from user where open_id = ?`
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
    let count
    if (postPage === 0) {
      sql = 'select count(*) as c from post where type = ?'
      const count = await new Promise(function(resolve, reject) {
        db.query(sql, [type], function(err, result) {
          if (!err) {
            resolve(result)
          } else {
            reject(err)
          }
        })
      })
      return res.json({count: count[0].c, postList, status: 1})
    }
    res.json({postList, status: 1})
  } catch(err) {
    res.json({message: '获取列表失败', status: 0})
    throw err
  }  
})

// 发帖
router.post('/create', async function (req, res, next) {
  try {
    let sql = `insert into post (content, category_id, open_id, create_time, type, anonymity) values (?, ?, ?, ?, ?, ?)`
    const {content, category_id, type, anonymity, images} = req.body
    let openid = jwt.decode(req.headers.token, jwtKey).openid
    const creatTime = moment().format('YYYY-MM-DD HH:mm:ss')
    const post = await new Promise((resolve, reject) => {
      db.query(sql, [content, category_id, openid, creatTime, type, anonymity], function(err, result) {
        if (!err) {
          resolve(result)
        } else {
          reject(err)
        }
      })
    })
    if (images.length > 0) {
      sql = 'insert into post_pic (post_id, pic_url) values (?, ?)'
      for (image of images) {
        await new Promise((resolve, reject) => {
          db.query(sql, [post.insertId, image], function(err, result) {
            if (!err) {
              resolve(result)
            } else {
              console.log(err)
              reject(err)
            }
          })
        })
      }
    }
    res.json({status: 1})
  } catch (err) {
    console.log(err)
    res.json({message: '发布失败', status: 0})
    throw err
  }
})

// 点赞
router.post('/praise', async function (req, res, next) {
  let openid = jwt.decode(req.headers.token, jwtKey).openid
  const {postId, status, type} = req.body
  let sql = 'select * from praise where open_id = ? and praise_at_id = ? and type = ?'
  const praise = await new Promise(function(resolve, reject) {
    db.query(sql, [openid, postId, type], function(err, result) {
      resolve(result)
    })
  })
  if (praise.length === 0) {
    let sql = 'insert into praise (open_id, praise_at_id, status, type) values(?, ?, 1, ?)'
    try {
      const addPraise = await new Promise(function(resolve, reject) {
        db.query(sql, [openid, postId, type], function(err, result) {
          if (!err) {
            resolve(result)
          } else {
            reject(err)
          }
        })
      })
    } catch (err) {
      res.json({message: '点赞失败', status: 0})
      throw err
    }
  } else {
    let sql = 'update praise set status=? where open_id=? and praise_at_id=? and type = ?'
    try {
      const addPraise = await new Promise(function(resolve, reject) {
        db.query(sql, [status, openid, postId, type], function(err, result) {
          if (!err) {
            resolve(result)
          } else {
            reject(err)
          }
        })
      })
    } catch(err) {
      res.json({message: '操作失败', status: 0})
      throw err
    }
  }
  res.json({reply, status: 1})
})

// 回帖
router.post('/reply', async function (req, res, next) {
  try {
    let openid = jwt.decode(req.headers.token, jwtKey).openid
    let sql = `insert into reply (content, post_id, user_id, user_name, at_user_id, at_user_name) values (?, ?, ?, ?, ?, ?)`
    const {content, at_user_id, post_id, at_user_name, user_name} = req.body
    await new Promise(function (resolve, reject) {
      db.query(sql, [content, post_id, openid, user_name, at_user_id, at_user_name], function(err, result) {
        if (!err) {
          resolve(result)
        } else {
          reject(err)
        }
      })
    })
    sql = `select * from user where open_id = ?`
    const user = await new Promise(function(resolve, reject) {
      db.query(sql, [openid], function(err, result) {
        if (!err) {
          resolve(result)
        } else {
          reject(err)
        }
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
  } catch (err) {
    res.json({message: '回帖失败', status: 0})
  }
  
})

module.exports = router;
