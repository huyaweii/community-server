const db = require('../utils/db')
const shopkeeper = {
  add: async values => {
    let sql = `insert into service set ?`
    return await db.asyncQuery(sql, [values])
  },
  delete: async id => {
    let sql = 'delete from service where id = ?'
    return await db.asyncQuery(sql, [id])
  },
  update: async (id, values) => {
    let sql = 'update shopkeeper set ? where id = ?'
    return await db.asyncQuery(sql, [values, id])
  },
  find: async (serviceid) => {
    let sql = 'select * from shopkeeper where service_id = ?'
    return await db.asyncQuery(sql, [serviceid])
  }
}
module.exports = shopkeeper