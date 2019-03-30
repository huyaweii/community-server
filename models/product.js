const db = require('../utils/db')
const product = {
  add: async values => {
    let sql = `insert into product set ?`
    return await db.asyncQuery(sql, [values])
  },
  delete: async id => {
    let sql = 'delete from product where id = ?'
    return await db.asyncQuery(sql, [id])
  },
  update: async (id, values) => {
    let sql = 'update product set ? where id = ?'
    return await db.asyncQuery(sql, [values, id])
  },
  find: async (openid) => {
    let sql = 'select * from product where openid = ? order by id desc'
    return await db.asyncQuery(sql, [openid])
  },
  findOne: async (name, value) => {
    let sql = 'select * from product where ?? = ?'
    const res = await db.asyncQuery(sql, [name, value])
    if (res.length > 0) {
      return res[0]
    }
    return null
  }
}
module.exports = product