const { User } = require("../models.js")
const { startOptions } = require("../options.js")


const limitRequestsMiddleware = async (ctx, next) => {
    const chatId = ctx.chat.id
    const user = await User.findOne({ where: { chatId } })

    if (user) {
        if (user.role === 'admin') {
            return next()
        }
        const currentDate = new Date()
        const previousRequestDate = user.lastRequestTimestamp
        const timeDifference = currentDate - previousRequestDate

        // Проверяем, прошло ли достаточное время с предыдущего запроса
        if (timeDifference < 1000) { // Например, 1000 миллисекунд (1 секунда)
            // Увеличиваем количество предупреждений
            const warningCount = user.warningCount + 1
            user.warningCount = warningCount
            await user.save()

            // Проверяем, нужно ли блокировать пользователя
            if (warningCount > 1) {
                // Вычисляем время блокировки в часах (геометрическая прогрессия)
                const blockHours = Math.pow(2, warningCount - 2)
                const blockUntil = new Date(Date.now() + blockHours * 60 * 60 * 1000)
                user.blocked = true
                user.blocked_until = blockUntil
                await user.save()

                // Возвращаем ошибку пользователю
                const blockDuration = blockHours === 1 ? '1 час' : `${blockHours} часов`
                return ctx.reply(`За ${warningCount} предупреждение, за частые запросы, вы получаете ${blockDuration} бана.`)
            } else {
                // Предупреждаем пользователя о возможных последствиях за частые запросы
                return ctx.reply('Вы делаете запросы слишком часто. Пожалуйста, учтите, что за частые запросы ваш аккаунт может быть временно заблокирован.')
            }
        } else {
            // Проверяем, прошла ли неделя с момента последнего предупреждения
            const lastWarningDate = user.lastWarningTimestamp
            if (lastWarningDate && currentDate - lastWarningDate >= 7 * 24 * 60 * 60 * 1000) {
                // Если прошла неделя, сбрасываем количество предупреждений и время последнего предупреждения
                user.warningCount = 0
                user.lastWarningTimestamp = null
                await user.save()
            }
        }
    }

    await next()
}






const limitTikTokRequestsMiddleware = async (ctx, next) => {
    const chatId = ctx.chat.id
    const user = await User.findOne({ where: { chatId } })
  
    if (user) {
      if (user.role === 'admin') {
        await next()
        return
      }
  
      const currentDate = new Date()
      const today = new Date().setHours(0, 0, 0, 0)
  
      // Проверяем, прошел ли текущий день с момента последнего запроса
      if (user.lastTikTokRequestTimestamp < today) {
        // Сбрасываем счетчики запросов для нового дня
        user.successfulRequestsVideoTT = 0
        user.lastTikTokRequestTimestamp = currentDate
        await user.save()
      }
  
      const successfulRequests = user.successfulRequestsVideoTT
  
      // Проверяем, достигнуто ли ограничение на число удачных запросов в день
      if (successfulRequests >= 50) {
        await ctx.scene.leave() // Выходим из текущей сцены
        await ctx.reply('Вы достигли лимита запросов для TikTok на сегодня:', startOptions)

        return
      }
    }
  
    await next()
  }
  
  const limitYouTubeRequestsMiddleware = async (ctx, next) => {
    const chatId = ctx.chat.id
    const user = await User.findOne({ where: { chatId } })
  
    if (user) {
      if (user.role === 'admin') {
        await next()
        return
      }
  
      const currentDate = new Date()
      const today = new Date().setHours(0, 0, 0, 0)
  
      // Проверяем, прошел ли текущий день с момента последнего запроса
      if (user.lastYouTubeRequestTimestamp < today) {
        // Сбрасываем счетчики запросов для нового дня
        user.successfulRequestsAudioYT = 0
        user.lastYouTubeRequestTimestamp = currentDate
        await user.save()
      }
  
      const successfulRequests = user.successfulRequestsAudioYT
  
      // Проверяем, достигнуто ли ограничение на число удачных запросов в день
      if (successfulRequests >= 50) {
        await ctx.scene.leave() // Выходим из текущей сцены
        await ctx.reply('Вы достигли лимита запросов для YouTube на сегодня, можете выбрать другую функцию:', startOptions)

        return
      }
    }
  
    await next()
  }
  




module.exports = { limitRequestsMiddleware, limitTikTokRequestsMiddleware, limitYouTubeRequestsMiddleware }
