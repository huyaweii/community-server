const db = require('../utils/db')
const shopkeeper = {
  add: async values => {
    let sql = `insert into shopkeeper set ?`
    return await db.asyncQuery(sql, [values])
  },
  delete: async id => {
    let sql = 'delete from shopkeeper where id = ?'
    return await db.asyncQuery(sql, [id])
  },
  update: async (id, values) => {
    let sql = 'update shopkeeper set ? where id = ?'
    return await db.asyncQuery(sql, [values, id])
  },
  find: async (serviceid, page = 0, pageSize = 10) => {
    let sql = 'select * from shopkeeper where service_id = ? order by like_count desc limit ?, ?'
    return await db.asyncQuery(sql, [serviceid, page * pageSize, (page + 1) * pageSize])
  },
  findOne: async (name, value) => {
    let sql = 'select * from shopkeeper where ?? = ?'
    const res = await db.asyncQuery(sql, [name, value])
    if (res.length > 0) {
      return res[0]
    }
    return null
  }
}
module.exports = shopkeeper