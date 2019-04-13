const db = require('../utils/db')
const reply = {
  add: async values => {
    let sql = `insert into reply set ?`
    return await db.asyncQuery(sql, [values])
  },
  update: async (openid, values) => {
    let sql = 'update reply set ? where openid = ?'
    return await db.asyncQuery(sql, [values, openid])
  },
  findOne: async (name, value) => {
    let sql = 'select * from reply where ?? = ?'
    const res = await db.asyncQuery(sql, [name, value])
    if (res.length > 0) {
      return res[0]
    }
    return null
  },
  find: async (page = 0, pageSize = 10) => {
    let sql = 'select * from reply order by create_time desc limit ?, ?'
    return await db.asyncQuery(sql, [page * pageSize, (page + 1) * pageSize])
  }
}
module.exports = reply