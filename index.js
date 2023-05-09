const TelegramBot = require('node-telegram-bot-api')
const { startOptions, qualityOptions } = require('./options.js')
const { User } = require('./models.js')
const sequelize = require('./db.js')
const youtubedl = require('youtube-dl-exec')
const fs = require('fs')
const ytdl = require('ytdl-core')
const unorm = require('unorm')
require('dotenv').config()


const token = process.env.TOKEN_BOT
const bot = new TelegramBot(token, { polling: true })

const botName = '@AudioVisualGenieBot'


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
        const user = await User.findOne({ chatId })
        if (user) {
          return bot.sendMessage(chatId, 'Выберите опцию:', startOptions)
        }
        await User.create({ chatId })
        return bot.sendMessage(chatId, 'Выберите опцию:', startOptions)
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
        const videoUrl = msg.text;

        const videoInfo = await ytdl.getInfo(videoUrl)
        const title = videoInfo.videoDetails.title
        const normalizedTitle = unorm.nfc(`${title}.mp3`)

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
          output: `./downloads/${normalizedTitle}`,
          ffmpegLocation: '/usr/bin/ffmpeg'
        }).then(async output => {

          const filePath = `./downloads/${normalizedTitle}`

          bot.sendMessage(chatId, 'Загрузка началась, ожидайте...')
          bot.sendAudio(chatId, filePath, {
            caption: botName
          }).then(() => {
            console.log('Audio file uploaded')
            fs.unlinkSync(filePath)
          }).catch(err => {
            console.log('Error uploading audio file:', err)
          })
        })
      })
    }
  })






}

start()

