// const fs = require('fs')
// const youtubedl = require('youtube-dl-exec')
// const unorm = require('unorm')
// const { getCleanTiktokUrl } = require('../../normalizeLink.js')
// const { tiktokHandler, createTiktokHandlers, removeTiktokHandlers } = require('../../hendlers/tikTokHandler.js')
// const { User, AudioFile } = require('../../models.js')

// const { Builder, Browser, By, Key, until } = require('selenium-webdriver');
// const chrome = require('selenium-webdriver/chrome');


// const botName = 'скачано с помощью @AudioVisualGenieBot'
// const token = process.env.TOKEN_BOT

// console.log('tiktokHandler::', tiktokHandler)
// const options = new chrome.Options();
// const driver = new Builder()
//     .forBrowser('chrome')
//     .setChromeOptions(options)
//     .build();



// async function tiktokDownloader(bot, chatId) {
//     let normalizedFilename
//     let audioFile

//     const messageTiktokHandler = async (msg) => {
//         if (msg.chat.id === chatId) { // проверяем, что сообщение от того же пользователя, которому отправили запрос
//             console.log('test:0:')
//             const text = msg.text
//             if (text === '/start' || text === '/info') { return removeTiktokHandlers(bot, chatId) }
//             console.log('test:1:')


//             let videoUrl = msg.text
//             videoUrl = 'https://www.tiktok.com/@papayaho.cat/video/7235652263451069702'
//             // const normalizeTikTokUrl = await getCleanTiktokUrl(videoUrl)
//             // console.log('normalizeTikTokUrl::', normalizeTikTokUrl)

//             //   const videoInfo = await ytdl.getInfo(normalVideoUrl)

//             //   const authorName = videoInfo.videoDetails.author.name
//             //   const videoTitle = videoInfo.videoDetails.title
//             //   let filename = `${authorName}-${videoTitle}`.replace(/[/\\?%*:|"<>]/g, '').replace(/"/g, '\'').substr(0, 64)
//             //   normalizedFilename = unorm.nfc(`${filename}.mp3`)




//             try {

//                 // const VV = await driver.get(videoUrl)
//                 // console.log('VV::', VV)


//             } catch (error) {
//                 // await AudioFile.destroy({ where: { videoLink: normalVideoUrl } });
//                 // await downloadYoutubedl(bot, chatId, botName, videoTitle, normalizedFilename, normalVideoUrl);
//                 // console.error('Ошибка при получении файла:', error);
//             }


//         }
//     }


//       if (!tiktokHandler.has(chatId)) {
//         createTiktokHandlers(bot, chatId, messageTiktokHandler)
//       }
// }



// module.exports = { tiktokDownloader }


