const TelegramBot = require('node-telegram-bot-api')
const youtubedl = require('youtube-dl-exec')
const ytdl = require('ytdl-core')
const unorm = require('unorm')
const fs = require('fs')

const { startOptions, qualityOptions } = require('./options.js')
const { User, UserVideo, AudioFile } = require('./models.js')
const { handleDownloadAudio, audioDownloaderHandlers } = require('./audioDownloader.js')
const { downloadAudio } = require('./listener.js')
const sequelize = require('./db.js')

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
  const botName = '@AudioVisualGenieBot'


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
    
    if (option === 'edit_audio') {
      bot.removeListener('message', audioDownloaderHandlers.get(chatId))
      audioDownloaderHandlers.delete(chatId)
      console.log('audioDownloaderHandlers:11:', audioDownloaderHandlers)
      
      
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
      // let normalizedFilename;

      // const messageHandler = async (msg) => {
      //   if (msg.chat.id === chatId) { // проверяем, что сообщение от того же пользователя, которому отправили запрос
      //     const videoUrl = msg.text;
      //     try {
      //       const videoInfo = await ytdl.getInfo(videoUrl);
      //       const authorName = videoInfo.videoDetails.author.name;
      //       const videoTitle = videoInfo.videoDetails.title;

      //       let filename = `${authorName}-${videoTitle}`.replace(/[/\\?%*:|"<>]/g, '').replace(/"/g, '\'').substr(0, 64);
      //       normalizedFilename = unorm.nfc(`${filename}.mp3`);
      //       await bot.sendMessage(chatId, `Загрузка видео "${videoTitle.substr(0, 15)}.." началась, ожидайте`);
      //     } catch (e) {
      //       await bot.sendMessage(chatId, 'Не удалось найти видео по указанной ссылке. Пожалуйста, убедитесь, что вы ввели правильную ссылку и повторите попытку:');
      //       console.log("chatId:00:", chatId);
      //       return;
      //     }

      //     youtubedl(videoUrl, {
      //       noCheckCertificates: true,
      //       noWarnings: true,
      //       preferFreeFormats: true,
      //       addHeader: [
      //         'referer:youtube.com',
      //         'user-agent:googlebot'
      //       ],
      //       extractAudio: true,
      //       audioFormat: 'mp3',
      //       audioMultistreams: true,
      //       output: `./downloads/${normalizedFilename}`,
      //       ffmpegLocation: '/usr/bin/ffmpeg'
      //     }).then(async output => {
      //       let filePath = `./downloads/${normalizedFilename}`;

      //       try {
      //         const fileStats = fs.statSync(filePath);
      //         const response = await bot.sendAudio(chatId, filePath, {
      //           caption: botName,
      //           contentType: 'audio/mpeg', // явно указываем тип контента
      //           fileSize: fileStats.size // явно указываем размер файла
      //         });
      //         console.log('Audio file uploaded');
      //         // fs.unlinkSync(filePath);
      //       } catch (error) {
      //         console.log('Error uploading audio file:', error);
      //       }
      //     }).catch(async err => {
      //       console.log('Error downloading audio file:', err)

      //       return bot.sendMessage(chatId, 'Произошла ошибка при загрузке аудио файла, повторите попытку')
      //     }).finally(() => {
      //       // удаляем обработчик сообщений после загрузки или при ошибке
      //       // bot.removeListener('message', messageHandler);
      //       // messageHandlers.delete(chatId);
      //     });
      //   }
      // };

      // messageHandlers.set(chatId, messageHandler);
      // console.log('messageHandlers:1:', messageHandlers)

      // // // подписываемся на событие 'message' только для текущего пользователя
      // bot.on('message', messageHandler)
      // console.log('messageHandler:1:', messageHandler)

      // // // удаляем обработчик, если пользователь не ввел ссылку в течение 10 минут
      // // setTimeout(() => {
      // //   bot.removeListener('message', messageHandler);
      // //   messageHandlers.delete(chatId);
      // // }, 10 * 60 * 1000);
    }
  })












  // bot.on('callback_query', async query => {
  //   const chatId = query.message.chat.id
  //   const option = query.data

  //   if (option === 'downloadAudio') {
  //     await downloadAudio(bot, chatId)
  //     // await bot.sendMessage(chatId, 'Введите ссылку на видео:')
  //     // await bot.removeListener('sendMessage', downloadAudio)

  //     // await bot.removeListener('message', () => downloadAudio(bot, chatId))

  //     // await stopDownloadAudio(bot, chatId)

  //     // await bot.sendMessage(chatId, 'Введите ссылку на видео:')
  //     // console.log('myEmitter:1:', myEmitter)
  //     // myEmitter.on('downloadAudio', downloadAudioHandler); // сначала добавляем обработчик событий
  //     // myEmitter.emit('downloadAudio', chatId) // затем генерируем событие
  //     // console.log('myEmitter:2:', myEmitter)
  //     // bot.off('chatId', listener)

  //     // await handleDownloadAudio(bot, chatId)
  //     let normalizedFilename




  //     const audioDownloader = await bot.on('message', async (msg) => {
  //       const videoUrl = msg.text
  //       try {
  //         const videoInfo = await ytdl.getInfo(videoUrl)
  //         const authorName = videoInfo.videoDetails.author.name
  //         const videoTitle = videoInfo.videoDetails.title

  //         let filename = `${authorName}-${videoTitle}`.replace(/[/\\?%*:|"<>]/g, '').replace(/"/g, '\'').substr(0, 64)
  //         normalizedFilename = unorm.nfc(`${filename}.mp3`)
  //         await bot.sendMessage(chatId, `Загрузка видео "${videoTitle.substr(0, 15)}.." началась, ожидайте`)
  //       } catch (e) {
  //         // await bot.removeListener('message', handleDownloadAudio.audioDownloader)

  //         await bot.sendMessage(chatId, 'Не удалось найти видео по указанной ссылке. Пожалуйста, убедитесь, что вы ввели правильную ссылку и повторите попытку:')
  //         console.log("chatId:00:", chatId)


  //         return
  //       }

  //       youtubedl(videoUrl, {
  //         noCheckCertificates: true,
  //         noWarnings: true,
  //         preferFreeFormats: true,
  //         addHeader: [
  //           'referer:youtube.com',
  //           'user-agent:googlebot'
  //         ],
  //         extractAudio: true,
  //         audioFormat: 'mp3',
  //         audioMultistreams: true,
  //         output: `./downloads/${normalizedFilename}`,
  //         ffmpegLocation: '/usr/bin/ffmpeg'
  //       }).then(async output => {
  //         let filePath = `./downloads/${normalizedFilename}`

  //         // await audioDownloader(bot, chatId, filePath)
  //         try {
  //           const fileStats = fs.statSync(filePath);
  //           const response = await bot.sendAudio(chatId, filePath, {
  //             caption: botName,
  //             contentType: 'audio/mpeg', // явно указываем тип контента
  //             fileSize: fileStats.size // явно указываем размер файла
  //           });
  //           console.log('Audio file uploaded');
  //           // fs.unlinkSync(filePath);
  //         } catch (error) {
  //           console.log('Error uploading audio file:', error);
  //         }

  //       }).catch(async err => {
  //         console.log('Error downloading audio file:', err)

  //         return bot.sendMessage(chatId, 'Произошла ошибка при загрузке аудио файла')
  //       })
  //     })



  //     }
  //   })
}






start()