const { VideoTiktok } = require('../../models.js')

const { checkTiktokVideoUrl } = require('../../utils/checkUrl.js')
const { getVideoMetadata, sendVideoFromFileId } = require('./tiktokFunction.js')
const { downloadYoutubedlShorts } = require('../YTShortsProcessing/YTShortsDownloader.js')

const { langObject } = require('../../langObject.js')







async function tiktokDownloader(bot, tiktokDownloaderScene) {

    tiktokDownloaderScene.hears(/.*/, async (ctx) => {
        const chatId = ctx.chat.id
        const userLanguage = ctx.language

        const { message_id } = await ctx.reply(langObject[userLanguage].processing_has_begun, { chatId })

        try {
            let videoUrl = ctx.message.text

            const { videoUrlId, videoFullUrl } = await checkTiktokVideoUrl(ctx, videoUrl, message_id)

            try {
                const videoFile = await VideoTiktok.findOne({ where: { videoLink: videoFullUrl } })

                if (!videoFile) {
                    console.log('Запись о файле не найдена в базе данных')
                    if (videoFullUrl.includes('https://www.youtube')) {
                        await downloadYoutubedlShorts(ctx, videoFullUrl, message_id)
                    } else {
                        await getVideoMetadata(ctx, videoUrlId, videoFullUrl, message_id)
                    }
                    return console.log('файл отправлен')
                }
                const telegramFile = await bot.telegram.getFile(videoFile.fileVideoId)

                if (telegramFile) {
                    return sendVideoFromFileId(ctx, videoFile.fileVideoId, message_id)
                } 
            } catch (error) {
                await VideoTiktok.destroy({ where: { videoLink: videoFullUrl } })
                    if (videoFullUrl.includes('https://www.youtube')) {
                        await downloadYoutubedlShorts(ctx, videoFullUrl, message_id)
                    } else {
                        await getVideoMetadata(ctx, videoUrlId, videoFullUrl, message_id)
                    }
                    return console.log('файл отправлен')
            }
        } catch (error) {
            console.error('Произошла ошибка глобального try/catch (tiktokDownloader): ', error);
            return ctx.telegram.editMessageText(chatId, message_id, message_id, langObject[userLanguage].download_failed_please_try_again)
        }
    })

}






module.exports = { tiktokDownloader }