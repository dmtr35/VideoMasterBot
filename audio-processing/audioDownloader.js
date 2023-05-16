const fs = require('fs')
const youtubedl = require('youtube-dl-exec')
const ytdl = require('ytdl-core')
const unorm = require('unorm')
const { sendAudioTelegram, splitFile } = require('./audioFunction.js')
const { mageHandlers, createmageHandlers, removemageHandlers } = require('../handlers.js')
const { getCleanVideoUrl } = require('../normalizeLink.js')
const { User, UserVideo, AudioFile } = require('../models.js')

const botName = '@AudioVisualGenieBot'

// const mageHandlers = new Map()




async function audioDownloader(bot, chatId) {
  let normalizedFilename
  let filePath
  let fileStats

  const messageAudioHandler = async (msg) => {
    if (msg.chat.id === chatId) { // проверяем, что сообщение от того же пользователя, которому отправили запрос
      const text = msg.text
      if (text === '/start' || text === '/info') { return removemageHandlers(bot, chatId) }

      const videoUrl = msg.text
      const normalVideoUrl = await getCleanVideoUrl(videoUrl)

      // =========================================================================
      // try {
      //   // // Поиск пользователя в таблице User по chatId
      //   // const user = await User.findOne({ where: { chatId } });
      //   // console.log('user::', user);
      //   // if (user) {
      //     // Поиск видео в таблице UserVideo по ссылке
      //     const existingVideo = await UserVideo.findOne({ where: { videoLink: normalVideoUrl } });
      //     console.log('existingVideo::', existingVideo);
      
      //     if (existingVideo) {
      //       console.log('Видео уже существует в базе данных.');
      //     } else {
      //       // Создание записи в таблице UserVideo с chatId и ссылкой
      //       await UserVideo.create({ videoLink: normalVideoUrl, chatId });
      //       console.log('Ссылка сохранена успешно.');
      //     }
      //   // } else {
      //     // console.log('Пользователь с указанным chatId не найден.');
      //   // }
      // } catch (error) {
      //   console.error('Ошибка при сохранении ссылки:', error);
      // }
      // =====================================================================
      try {
        const videoInfo = await ytdl.getInfo(normalVideoUrl)
        console.log('videoInfo::', videoInfo);

        const authorName = videoInfo.videoDetails.author.name
        const videoTitle = videoInfo.videoDetails.title
        let filename = `${authorName}-${videoTitle}`.replace(/[/\\?%*:|"<>]/g, '').replace(/"/g, '\'').substr(0, 64)
        normalizedFilename = unorm.nfc(`${filename}.mp3`)
        filePath = `./downloads/${normalizedFilename}`


        if (fs.existsSync(filePath)) {
          fileStats = fs.statSync(filePath)
          console.log(`File ${normalizedFilename} already exists on disk`)

          // -----------------------------------------------------------------------



          // -----------------------------------------------------------------------
          sendAudioTelegram(bot, chatId, botName, filePath, fileStats)
          return console.log(`File ${normalizedFilename} sent to chat ${chatId}`)
        }

        await bot.sendMessage(chatId, `Загрузка видео "${videoTitle.substr(0, 15)}.." началась, ожидайте`)
      } catch (e) {
        await bot.sendMessage(chatId, 'Не удалось найти видео по указанной ссылке. Пожалуйста, убедитесь, что вы ввели правильную ссылку и повторите попытку:')
        console.log("chatId:00:", chatId)
        return
      }


      // ===================================================================
      youtubedl(normalVideoUrl, {
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
        try {
          fileStats = fs.statSync(filePath)
          console.log('fileStats::', fileStats)
          await sendAudioTelegram(bot, chatId, botName, filePath, fileStats)

          console.log('Audio file uploaded')
          // fs.unlinkSync(filePath) // удалить загруженый файл
        } catch (error) {
          console.log('Error uploading audio file:', error)
        }
      }).catch(async err => {
        console.log('Error downloading audio file:', err)
        return bot.sendMessage(chatId, 'Произошла ошибка при загрузке аудио файла, повторите попытку')
      })
    }
  }


  if (!mageHandlers.has(chatId)) {
    createmageHandlers(bot, chatId, messageAudioHandler)
  }
}



module.exports = { audioDownloader }



