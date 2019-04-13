const db = require('../utils/db')
const postPic = {
  add: async values => {
    let sql = `insert into post_pic set ?`
    return await db.asyncQuery(sql, [values])
  },
  find: async (post_id) => {
    let sql = 'select * from post_pic where post_id = ?'
    return await db.asyncQuery(sql, [post_id])
  },
}
module.exports = postPic