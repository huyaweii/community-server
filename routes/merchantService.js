var express = require('express');
var router = express.Router();
const axios = require('axios')
var app = express();
var moment = require('moment')
moment.locale('zh-cn')
var jwt = require('jwt-simple')
var {db, jwtKey} = require('../config')  

router.get('/', async function(req, res, next) {
  let sql = 'select * from service'
  try {
    const services = await new Promise((resolve, reject) => {
      db.query(sql, [], function(err, result) {
        if (!err) {
          resolve(result)
        } else {
          reject(err)
        }
      })
    })
    res.json({services, status: 1})
  } catch (err) {
    res.json({services: [], status: 0})
    throw err
  }
})

router.get('/:id/shopkeepers', async function(req, res, next) {
  const {id} = req.params
  let openid = jwt.decode(req.headers.token, jwtKey).openid
  let sql = 'select * from shopkeeper where service_id = ? and status = 2 order by praise_count desc'
  try {
    const shopkeepers = await new Promise((resolve, reject) => {
      db.query(sql, [Number(id)], function(err, result) {
        if (!err) {
          resolve(result)
        } else {
          reject(err)
        }
      })
    })
    for (const shopkeeper of shopkeepers) {
      let sql = `select * from user where open_id = ?`
      const user = await new Promise(function(resolve, reject) {
        db.query(sql, [shopkeeper.open_id], function(err, result) {
          if (!err) {
            resolve(result)
          } else {
            reject(err)
          }
        })
      })
      shopkeeper.user = {
        name: user[0].name,
        id: user[0].open_id,
        avatar: user[0].avatar
      }

      sql = "select * from praise where open_id = ? and praise_at_id = ? and type = 'shopkeeper'"
      const praise = await new Promise(function(resolve, reject) {
        db.query(sql, [openid, shopkeeper.id], function(err, result) {
          if (!err) {
            resolve(result)
          } else {
            reject(err)
          }
        })
      })
      shopkeeper.is_praised = praise.length > 0 && praise[0].status

      sql = 'select count(*) as c from praise where praise_at_id = ? and status = 1'
      const count = await new Promise(function(resolve, reject) {
        db.query(sql, [shopkeeper.id], function(err, result) {
          if (!err) {
            resolve(result)
          } else {
            reject(err)
          }
        })
      })
      shopkeeper.praise_count = count[0].c
    }
    res.json({shopkeepers, status: 1})
  } catch (err) {
    res.json({shopkeepers: [], status: 0})
    throw err
  }
})

// 点赞
router.post('/shopkeeper/:id/praise', async function (req, res, next) {
  let openid = jwt.decode(req.headers.token, jwtKey).openid
  const {shopkeeperId, status, type} = req.body
  let sql = 'select * from praise where open_id = ? and praise_at_id = ? and type = ?'
  const praise = await new Promise(function(resolve, reject) {
    db.query(sql, [openid, shopkeeperId, type], function(err, result) {
      resolve(result)
    })
  })
  if (praise.length === 0) {
    let sql = 'insert into praise (open_id, praise_at_id, status, type) values(?, ?, 1, ?)'
    try {
      const addPraise = await new Promise(function(resolve, reject) {
        db.query(sql, [openid, shopkeeperId, type], function(err, result) {
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
        db.query(sql, [status, openid, shopkeeperId, type], function(err, result) {
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

// 创建商家
router.post('/shopkeeper', async function (req, res, next) {
  let openid = jwt.decode(req.headers.token, jwtKey).openid
  const {shop_name, keeper_name, service_id, address, telephone} = req.body
  let sql = 'insert into shopkeeper (open_id, shop_name, keeper_name, service_id, address, telephone, status) values (?, ?, ?, ?, ?, ?, 1)'
  try {
    const result = await new Promise(function(resolve, reject) {
      db.query(sql, [openid, shop_name, keeper_name, service_id, address, telephone], function(err, result) {
        if (!err) {
          resolve(result)
        } else {
          reject(err)
        }
      })
    })
    res.json({shopkeeper: {...req.body, status: 1}, status: 1})  
  } catch (err) {
    res.json({status: 0})
    throw err  
  }
})
// 创建商家
router.post('/shopkeeper/:id', async function (req, res, next) {
  let openid = jwt.decode(req.headers.token, jwtKey).openid
  const {shop_name, keeper_name, service_id, address, telephone} = req.body
  const {id}=req.params
  let sql = 'update shopkeeper set open_id = ?, shop_name = ?, keeper_name = ?, service_id = ?, address = ?, telephone = ?, status = 1 where id = ?'
  try {
    const result = await new Promise(function(resolve, reject) {
      db.query(sql, [openid, shop_name, keeper_name, service_id, address, telephone, id], function(err, result) {
        if (!err) {
          resolve(result)
        } else {
          reject(err)
        }
      })
    })
    res.json({shopkeeper: {...req.body, status: 1}, status: 1})  
  } catch (err) {
    res.json({status: 0})
    throw err  
  }
})

// 创建商家
router.get('/shopkeeper/mine', async function (req, res, next) {
  let openid = jwt.decode(req.headers.token, jwtKey).openid
  let sql = 'select * from shopkeeper where open_id = ?'
  try {
    const shopkeeper = await new Promise(function(resolve, reject) {
      db.query(sql, [openid], function(err, result) {
        if (!err) {
          resolve(result)
        } else {
          reject(err)
        }
      })
    })
    res.json({shopkeeper, status: 1})  
  } catch (err) {
    res.json({status: 0})
    throw err  
  }
})

module.exports = router;
