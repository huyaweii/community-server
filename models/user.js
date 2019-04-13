const db = require('../utils/db')
const user = {
  add: async values => {
    let sql = `insert into user set ?`
    return await db.asyncQuery(sql, [values])
  },
  update: async (openid, values) => {
    let sql = 'update user set ? where openid = ?'
    return await db.asyncQuery(sql, [values, openid])
  },
  findOne: async (name, value) => {
    let sql = 'select * from user where ?? = ?'
    const res = await db.asyncQuery(sql, [name, value])
    if (res.length > 0) {
      return res[0]
    }
    return null
  }
}
module.exports = user