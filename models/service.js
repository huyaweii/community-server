const db = require('../utils/db')
const service = {
  add: async values => {
    let sql = `insert into service set ?`
    return await db.asyncQuery(sql, [values])
  },
  delete: async id => {
    let sql = 'delete from service where id = ?'
    return await db.asyncQuery(sql, [id])
  },
  find: async () => {
    let sql = 'select * from service order by priority desc'
    return await db.asyncQuery(sql)
  }
}
module.exports = service