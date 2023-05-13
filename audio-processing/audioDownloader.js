const fs = require('fs');
const youtubedl = require('youtube-dl-exec')
const ytdl = require('ytdl-core')
const unorm = require('unorm')

const botName = '@AudioVisualGenieBot'

const audioDownloaderHandlers = new Map();



async function handleDownloadAudio(bot, chatId) {
  let normalizedFilename;

  const messageHandler = async (msg) => {
    if (msg.chat.id === chatId) { // проверяем, что сообщение от того же пользователя, которому отправили запрос
      const text = msg.text
      if (text === '/start' || text === '/info') {
        bot.removeListener('message', audioDownloaderHandlers.get(chatId))
        audioDownloaderHandlers.delete(chatId)
        return
      }
      const videoUrl = msg.text;
      try {
        const videoInfo = await ytdl.getInfo(videoUrl);
        const authorName = videoInfo.videoDetails.author.name;
        const videoTitle = videoInfo.videoDetails.title;

        let filename = `${authorName}-${videoTitle}`.replace(/[/\\?%*:|"<>]/g, '').replace(/"/g, '\'').substr(0, 64);
        normalizedFilename = unorm.nfc(`${filename}.mp3`);
        await bot.sendMessage(chatId, `Загрузка видео "${videoTitle.substr(0, 15)}.." началась, ожидайте`);
      } catch (e) {
        await bot.sendMessage(chatId, 'Не удалось найти видео по указанной ссылке. Пожалуйста, убедитесь, что вы ввели правильную ссылку и повторите попытку:');
        console.log("chatId:00:", chatId);
        return;
      }

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
        let filePath = `./downloads/${normalizedFilename}`;

        try {
          const fileStats = fs.statSync(filePath);
          const response = await bot.sendAudio(chatId, filePath, {
            caption: botName,
            contentType: 'audio/mpeg',
            fileSize: fileStats.size
          });
          console.log('response::', response);
          console.log('Audio file uploaded');
          // fs.unlinkSync(filePath) // удалить загруженый файл
        } catch (error) {
          console.log('Error uploading audio file:', error);
        }
      }).catch(async err => {
        console.log('Error downloading audio file:', err)

        return bot.sendMessage(chatId, 'Произошла ошибка при загрузке аудио файла, повторите попытку')
      })
    }
  };

  audioDownloaderHandlers.set(chatId, messageHandler);
  console.log('audioDownloaderHandlers:1:', audioDownloaderHandlers)

  bot.on('message', messageHandler)
  console.log('messageHandler:1:', messageHandler)

}



module.exports = { handleDownloadAudio, audioDownloaderHandlers };



