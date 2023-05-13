const TelegramBot = require('node-telegram-bot-api')
const youtubedl = require('youtube-dl-exec')
const ytdl = require('ytdl-core')
const unorm = require('unorm')
const fs = require('fs')

const sequelize = require('./db.js')
const { startOptions, qualityOptions } = require('./options.js')
const { User, UserVideo, AudioFile } = require('./models.js')
const { handleDownloadAudio, audioDownloaderHandlers } = require('./audio-processing/audioDownloader.js')
// const middlewareCommand = require('./Middleware/MiddlewareCommand.js');


require('dotenv').config()

const token = process.env.TOKEN_BOT
const bot = new TelegramBot(token, { polling: true })
// bot.use(middlewareCommand(bot))


const start = async () => {
  try {
    await sequelize.authenticate()
    await sequelize.sync()
  } catch (e) {
    console.log('Подключение к бд сломалось', e)
  }

  bot.setMyCommands([
    { command: '/start', description: 'start message' },
    { command: '/info', description: 'get info' },
  ])
  const botName = '@AudioVisualGenieBot'

  bot.onText(/^\/start/, async (msg, match) => {
    const chatId = msg.chat.id;
    try {
      const user = await User.findOne({ where: { chatId } })
      if (user) {
        return bot.sendMessage(chatId, 'Выберите опцию1:', startOptions)
      }
      await User.create({ chatId })
      return bot.sendMessage(chatId, 'Выберите опцию2:', startOptions)
    } catch (e) {
      return bot.sendMessage(chatId, 'Произашла ошибка')
    }
  });
  



  bot.on('callback_query', async query => {
    const chatId = query.message.chat.id
    const option = query.data

    if (option === 'edit_audio') {
      bot.removeListener('message', audioDownloaderHandlers.get(chatId))
      audioDownloaderHandlers.delete(chatId)


      await bot.sendMessage(chatId, 'здесь мы будем редактировать аудио файлы')
      await bot.on('message', async (msg) => {
        await bot.sendMessage(chatId, 'запускается обработчик на edit audio')
      })
    }
  })






  bot.on('callback_query', async query => {
    const chatId = query.message.chat.id;
    const option = query.data;

    if (option === 'downloadAudio') {
      await bot.sendMessage(chatId, 'Введите ссылку на видео:');
      handleDownloadAudio(bot, chatId)
    }
  })










}






start()