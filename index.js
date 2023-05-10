const TelegramBot = require('node-telegram-bot-api')
const { startOptions, qualityOptions } = require('./options.js')
const { User } = require('./models.js')
const sequelize = require('./db.js')
const youtubedl = require('youtube-dl-exec')
const fs = require('fs')
const ytdl = require('ytdl-core')
const unorm = require('unorm')
const { audioDownloader } = require('./audioDownloader.js')
require('dotenv').config()


const token = process.env.TOKEN_BOT
const bot = new TelegramBot(token, { polling: true })



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



  bot.on('message', async msg => {
    const text = msg.text
    const chatId = msg.chat.id
    
    try {
      if (text === '/start') {
        const user = await User.findOne({ where: { chatId } })

        if (user) {
          return bot.sendMessage(chatId, 'Выберите опцию1:', startOptions)
        }
        await User.create({ chatId })
        return bot.sendMessage(chatId, 'Выберите опцию2:', startOptions)
      }
    } catch (e) {
      return bot.sendMessage(chatId, 'Произашла ошибка')
    }
  })




  bot.on('callback_query', async query => {
    const chatId = query.message.chat.id
    const option = query.data

    if (option === 'download audio') {
      bot.sendMessage(chatId, 'Введите ссылку на видео:')

      bot.once('message', async (msg) => {
        const videoUrl = msg.text



        const videoInfo = await ytdl.getInfo(videoUrl)
        const authorName = videoInfo.videoDetails.author.name
        const videoTitle = videoInfo.videoDetails.title

        let filename = `${authorName}-${videoTitle}`.replace(/[/\\?%*:|"<>]/g, '').replace(/"/g, '\'').substr(0, 64)
        const normalizedFilename = unorm.nfc(`${filename}.mp3`)


        bot.sendMessage(chatId, `Загрузка видио "${videoTitle.substr(0, 15)}.." началась, ожидайте`)
        youtubedl(videoUrl, {
          noCheckCertificates: true,
          noWarnings: true,
          preferFreeFormats: true,
          addHeader: [
            'referer:youtube.com',
            'user-agent:googlebot'
          ],
          extractAudio: true,
          audioFormat: 'mp3',
          audioMultistreams: true,
          output: `./downloads/${normalizedFilename}`,
          ffmpegLocation: '/usr/bin/ffmpeg'
        }).then(async output => {
          let filePath = `./downloads/${normalizedFilename}`

          await audioDownloader(bot, chatId, filePath)

        }).catch(err => {
          console.log('Error downloading audio file:', err)
          bot.sendMessage(chatId, 'Произошла ошибка при загрузке аудио файла')
        })
      })
    }
  })
}

start()

