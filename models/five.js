const db = require('../utils/db')
const product = {
  add: async values => {
    let sql = `insert into five set ?`
    return await db.asyncQuery(sql, [values])
  },
  delete: async id => {
    let sql = 'delete from five where id = ?'
    return await db.asyncQuery(sql, [id])
  },
  update: async (id, values) => {
    let sql = 'update five set ? where id = ?'
    return await db.asyncQuery(sql, [values, id])
  },
  find: async () => {
    let sql = 'select * from five order by id desc'
    return await db.asyncQuery(sql)
  }
}
module.exports = product