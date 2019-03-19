const db = require('../utils/db')
const shopkeeperLike = {
  add: async values => {
    let sql = `insert into shopkeeper_like set ?`
    return await db.asyncQuery(sql, [values])
  },
  delete: async id => {
    let sql = 'delete from shopkeeper_like where id = ?'
    return await db.asyncQuery(sql, [id])
  },
  findOne: async (shopkeeperId, openid) => {
    let sql = 'select * from shopkeeper_like where shopkeeper_id = ? and openid = ?'
    const res = await db.asyncQuery(sql, [shopkeeperId, openid])
    if (res.length > 0) {
      return res[0]
    }
    return null
  }
}
module.exports = shopkeeperLike



