const { Scenes, session, Telegraf } = require('telegraf')
const sequelize = require("./db.js")

const { getStartOptions, getLanguagesOptions } = require("./options.js")
const { getAndCreateUser } = require('./utils/userUtils.js')
const { langObject } = require('./langObject.js')
const { User } = require("./models.js")

const { audioDownloader } = require("./service/audioProcessing/audioDownloader.js")
const { tiktokDownloader } = require("./service/tiktok-processing/tiktokDownloader.js")

const { langMiddleware } = require('./middlewares/langMiddleware.js')
const { blockMiddleware } = require('./middlewares/blockMiddleware.js')
const { limitRequestsMiddleware, limitTikTokRequestsMiddleware, limitYouTubeRequestsMiddleware } = require('./middlewares/limitRequestsMiddleware.js')

require("dotenv").config()


const token = process.env.TOKEN_BOT
const bot = new Telegraf(token)
const languages = ['ru', 'en', 'ua']


bot.use(langMiddleware)
bot.use(blockMiddleware)
bot.use(limitRequestsMiddleware)


const audioDownloaderScene = new Scenes.BaseScene('audioDownloader')
const tiktokDownloaderScene = new Scenes.BaseScene('tiktokDownloader')


audioDownloaderScene.use(limitYouTubeRequestsMiddleware)
tiktokDownloaderScene.use(limitTikTokRequestsMiddleware)


const stage = new Scenes.Stage([audioDownloaderScene, tiktokDownloaderScene])



bot.use(session())
bot.use(stage.middleware())



// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

const start = async (ctx) => {

  try {
    await sequelize.authenticate()
    await sequelize.sync()
  } catch (e) {
    console.log('Подключение к бд сломалось', e)
  }

  // _______________________________________________________________________________________

  const handleStartCommand = async (ctx) => {
    await ctx.scene.leave()
    const chatId = ctx.chat.id
    const userLanguage = ctx.language

    try {
      const user = await User.findOne({ where: { chatId } })
      if (user) {
        const startOptions = getStartOptions(ctx)
        return ctx.reply(langObject[userLanguage].select_option, startOptions)
      } else {
        const languagesOptions = getLanguagesOptions(ctx)
        return ctx.reply(langObject[userLanguage].select_language, languagesOptions)
      }
    } catch (e) {
      return ctx.reply(langObject[userLanguage].error)
    }
  }
  bot.command('start', handleStartCommand)
  audioDownloaderScene.command('start', handleStartCommand)
  tiktokDownloaderScene.command('start', handleStartCommand)

  // _______________________________________________________________________________________

  const handleInfoCommand = async (ctx) => {
    const chatId = ctx.chat.id
    const userLanguage = ctx.language

    await getAndCreateUser(chatId)

    await ctx.scene.leave()
    try {
      const startOptions = getStartOptions(ctx)
      await ctx.replyWithHTML(langObject[userLanguage].infoMessage, startOptions)
    } catch (error) {
      console.error('Error sending info message:', error)
    }
  }
  bot.command('info', handleInfoCommand)
  audioDownloaderScene.command('info', handleInfoCommand)
  tiktokDownloaderScene.command('info', handleInfoCommand)

  // _______________________________________________________________________________________

  const handleLanguageCommand = async (ctx) => {
    const chatId = ctx.chat.id
    const userLanguage = ctx.language

    await getAndCreateUser(chatId)

    await ctx.scene.leave()
    try {
      const languagesOptions = getLanguagesOptions(ctx)
      return ctx.reply(langObject[userLanguage].select_language, languagesOptions)
    } catch (error) {
      console.error('Error sending language message:', error)
    }
  }
  bot.command('language', handleLanguageCommand)
  audioDownloaderScene.command('language', handleLanguageCommand)
  tiktokDownloaderScene.command('language', handleLanguageCommand)

  // ______________________________________________________________________________________


  // ------------------------------------------------------------------------------------
  bot.action('downloadTikTok', async (ctx) => {
    const chatId = ctx.chat.id
    const userLanguage = ctx.language

    await getAndCreateUser(chatId)

    await ctx.scene.leave('audioDownloader')

    await ctx.scene.enter('tiktokDownloader')
    await ctx.reply(langObject[userLanguage].enter_tiktok)
    await tiktokDownloader(bot, tiktokDownloaderScene)
  })


  bot.action('downloadAudio', async (ctx) => {
    const chatId = ctx.chat.id
    const userLanguage = ctx.language

    await getAndCreateUser(chatId)

    await ctx.scene.leave('tiktokDownloader')

    await ctx.scene.enter('audioDownloader')
    await ctx.reply(langObject[userLanguage].enter_YouTube)
    await audioDownloader(bot, audioDownloaderScene)
  })
  // ------------------------------------------------------------------------------------


  // ====================================================================================
  languages.forEach((language) => {
    bot.action(language, async (ctx) => {
      const chatId = ctx.chat.id
      let userLanguage = ctx.language

      const user = await User.findOne({ where: { chatId } })

      if (user) {
        try {
          await user.update({ language })
          const newCtx = { ...ctx, language }
          userLanguage = language
          const startOptions = getStartOptions(newCtx)
          return ctx.reply(langObject[userLanguage].select_option, startOptions)
        } catch (error) {
          console.error('Ошибка при обновлении языка пользователя:', error)
          await ctx.reply(langObject[userLanguage].error)
        }
      } else {
        try {
          await User.create({ chatId, language })
          const newCtx = { ...ctx, language }
          userLanguage = language
          const startOptions = getStartOptions(newCtx)
          return ctx.reply(langObject[userLanguage].select_option, startOptions)
        } catch (error) {
          console.error('Ошибка при создании пользователя:', error)
          await ctx.reply(langObject[userLanguage].error)

        }
      }
    })
  })
  // ====================================================================================
  bot.on('message', async (ctx) => {
    const chatId = ctx.chat.id
    const userLanguage = ctx.language

    await getAndCreateUser(chatId)

    const sceneId = ctx.session?.scene?.current?.scene?.id;
    if (!sceneId || (sceneId !== 'audioDownloader' && sceneId !== 'tiktokDownloader')) {
      const startOptions = getStartOptions(ctx)
      return ctx.reply(langObject[userLanguage].select_option, startOptions)
    }
  })



  bot.launch()
}



start()

