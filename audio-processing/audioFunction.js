const { AudioFile } = require('../models.js')
const fs = require('fs')
const youtubedl = require('youtube-dl-exec')
const ytdl = require('ytdl-core')
const unorm = require('unorm')


async function sendAudioTelegram(bot, chatId, botName, audioLink, file_size) {

  const response = await bot.sendAudio(chatId, audioLink, {
    caption: botName,
    contentType: 'audio/mpeg',
    fileSize: file_size
  })
  return response.audio.file_id;
}



async function downloadYoutubedl(bot, chatId, botName, normalizedFilename, normalVideoUrl) {
  const videoInfo = await ytdl.getInfo(normalVideoUrl)

  const authorName = videoInfo.videoDetails.author.name
  const videoTitle = videoInfo.videoDetails.title
  let filename = `${authorName}-${videoTitle}`.replace(/[/\\?%*:|"<>]/g, '').replace(/"/g, '\'').substr(0, 64)
  normalizedFilename = unorm.nfc(`${filename}.mp3`)

  await bot.sendMessage(chatId, `Загрузка видео "${videoTitle.substr(0, 15)}.." началась, ожидайте`)
  // console.log('normalizedFilename::', normalizedFilename)
  // console.log('normalVideoUrl::', normalVideoUrl)
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
      filePath = `./downloads/${normalizedFilename}`;
      fileStats = fs.statSync(filePath)
      const file_size = fileStats.size
      const fileId = await sendAudioTelegram(bot, chatId, botName, filePath, file_size)
      // const fileId = await sendAudioTelegram(bot, chatId, botName, audioLink, file_size);


      await AudioFile.create({ videoLink: normalVideoUrl, audioLink: fileId });
      console.log('Audio file uploaded')


      // console.log('message', message)
      // try {
      //   await bot.deleteMessage(chatId, message);
      //   await bot.
      //     console.log('Аудиофайл успешно удален.');
      // } catch (error) {
      //   console.error('Ошибка при удалении аудиофайла:', error);
      // }

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Ошибка при удалении файла:', err);
          // fs.unlinkSync(filePath) // удалить загруженый файл
        } else {
          console.log('Файл удален успешно:', filePath);
        }
      })
    } catch (error) {
      console.log('Error uploading audio file:', error)
    }
  }).catch(async err => {
    console.log('Error downloading audio file:', err)
    return bot.sendMessage(chatId, 'Произошла ошибка при загрузке аудио файла, повторите попытку')
  })
}








module.exports = { sendAudioTelegram, downloadYoutubedl }
