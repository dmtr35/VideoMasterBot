const fs = require('fs')
const youtubedl = require('youtube-dl-exec')
const ytdl = require('ytdl-core')
const unorm = require('unorm')
const { sendAudioTelegram, downloadYoutubedl } = require('./audioFunction.js')
const { audioHandler, createmageHandlers, removemageHandlers } = require('../handlers.js')
const { getCleanVideoUrl } = require('../normalizeLink.js')
const { User, AudioFile } = require('../models.js')

const botName = 'скачано с помощью @AudioVisualGenieBot'
const token = process.env.TOKEN_BOT

// const audioHandler = new Map()




async function audioDownloader(bot, chatId) {
  let normalizedFilename
  let audioFile

  const messageAudioHandler = async (msg) => {
    if (msg.chat.id === chatId) { // проверяем, что сообщение от того же пользователя, которому отправили запрос
      const text = msg.text
      if (text === '/start' || text === '/info') { return removemageHandlers(bot, chatId) }

      const videoUrl = msg.text
      const normalVideoUrl = await getCleanVideoUrl(videoUrl)


      try {
        audioFile = await AudioFile.findOne({ where: { videoLink: normalVideoUrl } });
        console.log("audioFile::", audioFile)

        if (!audioFile) {
          // console.log('Запись о файле не найдена в базе данных');
          await downloadYoutubedl(bot, chatId, botName, normalizedFilename, normalVideoUrl);
          return console.log(`Файл ${normalizedFilename} отправлен в чат ${chatId}`);
        }

        const telegramFile = await bot.getFile(audioFile.audioLink);
        if (telegramFile) {
          // console.log('Файл найден, выполняйте необходимые действия');
          await sendAudioTelegram(bot, chatId, botName, audioFile.audioLink);
        }

      } catch (error) {
        await AudioFile.destroy({ where: { videoLink: normalVideoUrl } });
        await downloadYoutubedl(bot, chatId, botName, normalizedFilename, normalVideoUrl);
        // console.error('Ошибка при получении файла:', error);
      }


    }
  }


  if (!audioHandler.has(chatId)) {
    createmageHandlers(bot, chatId, messageAudioHandler)
  }
}



module.exports = { audioDownloader }



