const { Scenes, session, Telegraf } = require('telegraf')

const sequelize = require("./db.js")
const { startOptions } = require("./options.js")
const { User } = require("./models.js")

const { audioDownloader } = require("./service/audioProcessing/audioDownloader.js")
const { tiktokDownloader } = require("./service/tiktok-processing/tiktokDownloader.js")

const { blockMiddleware } = require('./middlewares/blockMiddleware.js')
const { limitRequestsMiddleware, limitTikTokRequestsMiddleware, limitYouTubeRequestsMiddleware } = require('./middlewares/limitRequestsMiddleware.js')

require("dotenv").config()

const token = process.env.TOKEN_BOT
const bot = new Telegraf(token)
// bot.use(blockMiddleware)
// bot.use(limitRequestsMiddleware)

// bot.use(limitYouTubeRequestsMiddleware)
// bot.use(limitTikTokRequestsMiddleware)

const botName = "скачано с помощью @MediaWizardBot"

const audioDownloaderScene = new Scenes.BaseScene('audioDownloader')
const tiktokDownloaderScene = new Scenes.BaseScene('tiktokDownloader')


// audioDownloaderScene.use(limitYouTubeRequestsMiddleware)
// tiktokDownloaderScene.use(limitTikTokRequestsMiddleware)


const stage = new Scenes.Stage([audioDownloaderScene, tiktokDownloaderScene],
  //    {
  //   ttl: 0,
  // }
)


bot.use(session())
bot.use(stage.middleware())

// stage.register(audioDownloaderScene)
// stage.register(tiktokDownloaderScene)




const start = async () => {
  try {
    await sequelize.authenticate()
    await sequelize.sync()
  } catch (e) {
    console.log('Подключение к бд сломалось', e)
  }

  const handleStartCommand = async (ctx) => {
    await ctx.scene.leave()

    const chatId = ctx.chat.id
    try {
      const user = await User.findOne({ where: { chatId } })
      if (user) {
        return ctx.reply('Выберите опцию1:', startOptions)
      }
      await User.create({ chatId })
      return ctx.reply('Выберите опцию2:', startOptions)
    } catch (e) {
      return ctx.reply('Произошла ошибка')
    }
  }

  bot.command('start', handleStartCommand)
  audioDownloaderScene.command('start', handleStartCommand)
  tiktokDownloaderScene.command('start', handleStartCommand)






  bot.action('downloadTikTok', async (ctx) => {
    await ctx.scene.leave('audioDownloader')

    const chatId = ctx.chat.id;
    await ctx.scene.enter('tiktokDownloader')
    await ctx.reply('Введите ссылку на TikTok:')
    await tiktokDownloader(bot, chatId, botName, tiktokDownloaderScene)
  })


  bot.action('downloadAudio', async (ctx) => {
    await ctx.scene.leave('tiktokDownloader')

    const chatId = ctx.chat.id
    await ctx.scene.enter('audioDownloader')
    await ctx.reply('Введите ссылку на видео:')
    await audioDownloader(bot, chatId, botName, audioDownloaderScene)
  })



  // audioDownloaderScene.use(limitYouTubeRequestsMiddleware)
  // tiktokDownloaderScene.use(limitTikTokRequestsMiddleware)
  bot.launch()
}



start()



