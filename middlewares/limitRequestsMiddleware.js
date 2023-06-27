const { User } = require("../models.js")
const { langObject } = require('../langObject.js')
const { getStartOptions } = require("../options.js")





const limitRequestsMiddleware = async (ctx, next) => {
  const chatId = ctx.chat.id
  const userLanguage = ctx.language

  const user = await User.findOne({ where: { chatId } })

  if (user) {
    if (user.role === 'admin') {
      return next()
    }

    const requestInterval = 2000

    const currentDate = new Date()
    const previousRequestDate = user.lastRequestTimestamp
    const timeDifference = currentDate - previousRequestDate

    if (timeDifference < requestInterval) {
      // Проверяем, является ли текущий запрос продолжением последовательности запросов
      if (user.warningCount >= 10) {
        const blockMultiplier = 2 // Множитель геометрической прогрессии
        const baseBlockDuration = 1 // Базовая длительность блокировки в часах
        const blockHours = Math.pow(blockMultiplier, user.blockedCount) * baseBlockDuration

        // Блокировка пользователя
        user.blocked = true
        user.blocked_until = new Date(Date.now() + blockHours * 60 * 60 * 1000) // Блокировка на указанное количество часов
        user.blockedCount += 1 // Увеличиваем счетчик блокировок
        await user.save()

        // Сообщение пользователю
        const blockDuration = blockHours === 1 ? '1 час' : `${blockHours} часов`
        // const message = `За частые запросы вы получаете ${blockDuration} блокировки.`
        const message = langObject[userLanguage].warning_message.replace("%s", blockDuration)


        return ctx.reply(message)
      } else if (user.warningCount >= 1) {
        const previousWarningTimestamp = user.lastWarningTimestamp
        const warningTimeDifference = new Date() - previousWarningTimestamp

        if (warningTimeDifference >= requestInterval) {
          // Прерывание последовательности запросов - сбрасываем счетчик предупреждений
          user.warningCount = 0
          user.lastWarningTimestamp = new Date()
        } else {
          // Продолжение последовательности запросов, увеличиваем счетчик предупреждений
          user.warningCount++
          user.lastWarningTimestamp = new Date()
        }
      } else {
        // Начало последовательности запросов
        user.warningCount = 1
        user.lastWarningTimestamp = new Date()
      }
    } else {
      // Если прошло достаточное время с предыдущего запроса, сбрасываем счетчик и время последнего предупреждения
      user.warningCount = 0
      user.lastWarningTimestamp = null
    }

    user.lastRequestTimestamp = new Date()
    await user.save()
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
      const startOptions = getStartOptions(ctx)
      await ctx.reply(langObject[userLanguage].request_limit_TikTok, startOptions)

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
      const startOptions = getStartOptions(ctx)
      await ctx.reply(langObject[userLanguage].request_limit_YouTube, startOptions)


      return
    }
  }

  await next()
}





module.exports = { limitRequestsMiddleware, limitTikTokRequestsMiddleware, limitYouTubeRequestsMiddleware }
