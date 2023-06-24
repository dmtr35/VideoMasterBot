const { User } = require('../models.js')





async function getAndCreateUser(chatId) {
  let user = await User.findOne({ where: { chatId } })
  if (!user) {
    user = await User.create({ chatId })
  }
  return user
}






module.exports = {
  getAndCreateUser,
}
