const { User } = require("../models.js")




const blockMiddleware = async (ctx, next) => {
    const chatId = ctx.chat.id
    const user = await User.findOne({ where: { chatId } })

    // Проверяем, заблокирован ли пользователь
    if (user && user.blocked) {
        if (user.role === 'admin') {
            // Если пользователь с ролью admin, пропускаем проверку блокировки
            return next()
        }
        // Если пользователь заблокирован, проверяем, истек ли срок блокировки
        if (user.blocked_until && user.blocked_until > new Date()) {
            // Если срок блокировки не истек, отправляем сообщение о блокировке
            const remainingTime = Math.ceil((user.blocked_until - new Date()) / 1000 / 60); // Расчет оставшегося времени блокировки в минутах
            return ctx.reply(`Ваш аккаунт заблокирован. Попробуйте снова через ${remainingTime} мин.`)
        } else {
            // Если срок блокировки истек, разблокируем пользователя
            user.blocked = false
            user.blocked_until = null
            await user.save()
        }
    }
  
    await next()
  }
  





module.exports = { blockMiddleware }
  