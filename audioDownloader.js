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
            contentType: 'audio/mpeg', // явно указываем тип контента
            fileSize: fileStats.size // явно указываем размер файла
          });
          console.log('Audio file uploaded');
          // fs.unlinkSync(filePath);
        } catch (error) {
          console.log('Error uploading audio file:', error);
        }
      }).catch(async err => {
        console.log('Error downloading audio file:', err)

        return bot.sendMessage(chatId, 'Произошла ошибка при загрузке аудио файла, повторите попытку')
      }).finally(() => {
        // удаляем обработчик сообщений после загрузки или при ошибке
        // bot.removeListener('message', messageHandler);
        // audioDownloaderHandlers.delete(chatId);
      });
    }
  };

  audioDownloaderHandlers.set(chatId, messageHandler);
  console.log('messageHandlers:1:', audioDownloaderHandlers)

  // // подписываемся на событие 'message' только для текущего пользователя
  bot.on('message', messageHandler)
  console.log('messageHandler:1:', messageHandler)

  // // удаляем обработчик, если пользователь не ввел ссылку в течение 10 минут
  // setTimeout(() => {
  //   bot.removeListener('message', messageHandler);
  //   audioDownloaderHandlers.delete(chatId);
  // }, 10 * 60 * 1000);
}




// const audioDownloader = async (bot, chatId) => {
//   await bot.on('message', async (msg) => {
//     const videoUrl = msg.text
//     try {
//       const videoInfo = await ytdl.getInfo(videoUrl)
//       const authorName = videoInfo.videoDetails.author.name
//       const videoTitle = videoInfo.videoDetails.title

//       let filename = `${authorName}-${videoTitle}`.replace(/[/\\?%*:|"<>]/g, '').replace(/"/g, '\'').substr(0, 64)
//       normalizedFilename = unorm.nfc(`${filename}.mp3`)
//       await bot.sendMessage(chatId, `Загрузка видео "${videoTitle.substr(0, 15)}.." началась, ожидайте`)
//     } catch (e) {
//       await bot.removeListener('message', audioDownloader)

//       return bot.sendMessage(chatId, 'Не удалось найти видео по указанной ссылке. Пожалуйста, убедитесь, что вы ввели правильную ссылку и повторите попытку:')
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
//       let filePath = `./downloads/${normalizedFilename}`

//       // await audioDownloader(bot, chatId, filePath)
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

//       return bot.sendMessage(chatId, 'Произошла ошибка при загрузке аудио файла')
//     })
//   })
// }





// const audioDownloader = async (bot, chatId, filePath) => {
//   try {
//     const fileStats = fs.statSync(filePath);
//     const response = await bot.sendAudio(chatId, filePath, {
//       caption: botName,
//       contentType: 'audio/mpeg', // явно указываем тип контента
//       fileSize: fileStats.size // явно указываем размер файла
//     });
//     console.log('Audio file uploaded');
//     // fs.unlinkSync(filePath);
//   } catch (error) {
//     console.log('Error uploading audio file:', error);
//   }
// };

module.exports = { handleDownloadAudio, audioDownloaderHandlers };



