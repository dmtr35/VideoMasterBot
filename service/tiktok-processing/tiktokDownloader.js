const fs = require('fs')
const unorm = require('unorm')
const { checkTiktokUrl } = require('../../utils/checkUrl.js')
const { tiktokHandler, createTiktokHandlers, removeTiktokHandlers } = require('../../hendlers/tikTokHandler.js')
const { User, VideoTiktok } = require('../../models.js')
const { getVideoMetadata, sendVideoTelegram, sendVideoFromFileId } = require('./tiktokFunction.js')



const botName = 'скачано с помощью @MediaWizardBot'
const token = process.env.TOKEN_BOT

// console.log('tiktokHandler::', tiktokHandler)
// const options = new chrome.Options();
// const driver = new Builder()
//     .forBrowser('chrome')
//     .setChromeOptions(options)
//     .build();



async function tiktokDownloader(bot, chatId, botName) {
    let videoFile
    // console.log('bot:000:', bot)
    // console.log('chatId:000:', chatId)

    const messageTiktokHandler = async ctx => {
        try {
            if (ctx.chat.id === chatId) { // проверяем, что сообщение от того же пользователя, которому отправили запрос
                const text = ctx.message.text
                if (text === '/start' || text === '/info') { return removeTiktokHandlers(bot, chatId) }
                console.log('text:1:', text)

                let videoUrl = ctx.message.text

                // videoUrl = 'https://vt.tiktok.com/ZS8Ww4rvV/'
                videoUrl = 'https://www.tiktok.com/@vancityreynolds/video/7231232190019898667?lang=en&source=h5_m'
                // let videoPath = `/home/dm/WebstormProjects/my/current/bot/VideoMasterBot/downloads/vancityreynolds-Everything looks 05x better in Wrexham .mp4`
                // let videoTitle = `vancityreynolds-Everything looks 05x better in Wrexham`
                // console.log('videoUrl:0:', videoUrl)

                const { videoUrlId, videoFullUrl } = await checkTiktokUrl(ctx, chatId, videoUrl)
                // console.log('videoUrlId:6666666:', videoUrlId)


                // const { videoPath, videoTitle } = await getVideoMetadata(ctx, chatId, videoUrlId)
                // console.log('videoPath:6666666:', videoPath)
                // console.log('videoTitle:666666:', videoTitle)


                try {
                    videoFile = await VideoTiktok.findOne({ where: { videoLink: videoFullUrl } })

                    if (!videoFile) {
                        console.log('Запись о файле не найдена в базе данных');
                        const { videoPath, videoTitle } = await getVideoMetadata(ctx, chatId, videoUrlId)
                        const fileId = await sendVideoTelegram(ctx, videoPath, botName)
                        await VideoTiktok.create({ videoLink: videoFullUrl, fileVideoId: fileId, })
                        
                        return console.log(`Файл ${videoTitle} отправлен в чат ${chatId}`)
                        
                    }
                    // console.log("videoFile.fileVideoId::", videoFile.fileVideoId)
                    // let fileVideoId = videoFile.fileVideoId
                    // fileVideoId = 'https://www.tiktok.com/@vancityreynolds/video/7231232190019898667?lang=en&source=h5_m'

                    // let telegramFile = await bot.telegram.getFile(fileVideoId)
                    let telegramFile = await bot.telegram.getFile(videoFile.fileVideoId)

                    if (telegramFile) {
                        await sendVideoFromFileId(ctx, videoFile.fileVideoId, botName)
                    }
                } catch (error) {
                    await VideoTiktok.destroy({ where: { videoLink: videoFullUrl } })
                    const { videoPath, videoTitle } = await getVideoMetadata(ctx, chatId, videoUrlId)
                    console.log("videoPath::", videoPath)
                    console.log("videoTitle::", videoTitle)

                    const fileId = await sendVideoTelegram(ctx, videoPath, botName)
                    console.log("fileId::", fileId)

                    await VideoTiktok.create({ videoLink: videoFullUrl, fileVideoId: fileId, })

                    console.error(`Ошибка при получении файла ${videoTitle}:`, error);
                }
            }
        } catch (e) {
            // console.error('Произошла ошибка глобального try/catch (tiktokDownloader):', error);
            await ctx.telegram.sendMessage(chatId, 'Если загрузка не удалась, попробуйте еще раз позже:')
        }
    }

    // console.log('tiktokHandler:000:', tiktokHandler)

    // if (!tiktokHandler.has(chatId)) {
    //     createTiktokHandlers(bot, chatId, messageTiktokHandler)
    // }
}








module.exports = { tiktokDownloader }