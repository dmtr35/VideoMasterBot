const { Telegraf } = require('telegraf')

const sequelize = require("./db.js")
const { startOptions } = require("./options.js")
const { User } = require("./models.js")
const { audioDownloader } = require("./service/audioProcessing/audioDownloader.js")
const { tiktokDownloader } = require("./service/tiktok-processing/tiktokDownloader.js")
const { removeAudioHandlers, audioHandler } = require("./hendlers/audioHandler.js")
const { removeTiktokHandlers, tiktokHandler } = require("./hendlers/tikTokHandler.js")

require("dotenv").config()


// const {Builder, Browser, By, Key, until} = require('selenium-webdriver');
// const chrome = require('selenium-webdriver/chrome');

// console.log('tiktokHandler::', tiktokHandler)
// console.log('audioHandler::', audioHandler)
// audioDownloader()
const token = process.env.TOKEN_BOT
const bot = new Telegraf(token)
const botName = "скачано с помощью @MediaWizardBot"

// bot.stopPolling()

const start = async () => {
  try {
    await sequelize.authenticate()
    await sequelize.sync()
  } catch (e) {
    console.log('Подключение к бд сломалось', e)
  }

  bot.command('start', async (ctx) => {
    const chatId = ctx.chat.id

    try {
      const user = await User.findOne({ where: { chatId } })
      if (user) {
        return ctx.reply('Выберите опцию1:', startOptions)
      }
      await User.create({ chatId })
      return ctx.reply('Выберите опцию2:', startOptions)
    } catch (e) {
      return ctx.reply('Произашла ошибка')
    }
  })

  bot.action('downloadTikTok', async (ctx) => {
    const chatId = ctx.chat.id
    // await removeAudioHandlers(bot, chatId)
    // console.log('tiktokHandler::', tiktokHandler)
    // console.log('audioHandler::', audioHandler)
    await ctx.reply('Введите ссылку на TikTok:')
    await tiktokDownloader(bot, chatId, botName)
  })

  bot.action('downloadAudio', async (ctx) => {
    const chatId = ctx.chat.id
    // await removeTiktokHandlers(bot, chatId)
    // console.log('tiktokHandler::', tiktokHandler)
    // console.log('audioHandler::', audioHandler)
    await ctx.reply('Введите ссылку на видео:')
    await audioDownloader(bot, chatId, botName)
  })

  bot.launch()
}

start()
