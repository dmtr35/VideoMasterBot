const { User } = require("../models.js");




const langMiddleware = async (ctx, next) => {
  const chatId = ctx.chat.id
  const user = await User.findOne({ where: { chatId } })

  const userLanguage = user ? user.language : 'ua'

  ctx.language = userLanguage

  return next()
}



module.exports = { langMiddleware }
