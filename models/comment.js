const db = require('../utils/db')
const comment = {
  add: async values => {
    let sql = `insert into comment set ?`
    return await db.asyncQuery(sql, [values])
  },
  update: async (openid, values) => {
    let sql = 'update comment set ? where openid = ?'
    return await db.asyncQuery(sql, [values, openid])
  },
  findOne: async (name, value) => {
    let sql = 'select * from comment where ?? = ?'
    const res = await db.asyncQuery(sql, [name, value])
    if (res.length > 0) {
      return res[0]
    }
    return null
  },
  find: async (id, page = 0, pageSize = 10) => {
    let sql = 'select * from comment where post_id = ? limit ?, ?'
    return await db.asyncQuery(sql, [id, page * pageSize, (page + 1) * pageSize])
  }
}
module.exports = comment