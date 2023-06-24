const { User } = require("../models.js");




const langMiddleware = async (ctx, next) => {
  const chatId = ctx.chat.id
  const user = await User.findOne({ where: { chatId } })

  const userLanguage = user ? user.language : 'ru'

  ctx.language = userLanguage

  return next()
}



module.exports = { langMiddleware }
