const { VideoTiktok } = require('../../models.js')

const { checkTiktokVideoUrl } = require('../../utils/checkUrl.js')
const { getVideoMetadata, sendVideoFromFileId } = require('./tiktokFunction.js')








async function tiktokDownloader( bot, botName, tiktokDownloaderScene) {
    
    tiktokDownloaderScene.hears(/.*/, async (ctx) => {
        const chatId = ctx.chat.id
        const { message_id } = await ctx.reply(`Обработка началась, ожидайте ⚙️`, { chatId })


        try {
            let videoUrl = ctx.message.text

            const { videoUrlId, videoFullUrl } = await checkTiktokVideoUrl(ctx, videoUrl, message_id)
            try {
                const videoFile = await VideoTiktok.findOne({ where: { videoLink: videoFullUrl } })

                if (!videoFile) {
                    console.log('Запись о файле не найдена в базе данных')

                    await getVideoMetadata(ctx, videoUrlId, videoFullUrl, botName, message_id)
                    return console.log('файл отправлен')
                }
                const telegramFile = await bot.telegram.getFile(videoFile.fileVideoId)

                if (telegramFile) {
                    await sendVideoFromFileId(ctx, videoFile.fileVideoId, botName, message_id)
                } else {
                    await VideoTiktok.destroy({ where: { videoLink: videoFullUrl } })
                    await getVideoMetadata(ctx, videoUrlId, videoFullUrl, botName, message_id)

                    return console.log('файл отправлен')
                }
            } catch (error) {
                return console.error('Ошибка загрузки файла: ', error)
            }
        } catch (error) {
            console.error('Произошла ошибка глобального try/catch (tiktokDownloader): ', error);
        }
    })

}






module.exports = { tiktokDownloader }