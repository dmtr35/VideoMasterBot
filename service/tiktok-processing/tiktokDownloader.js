const { checkTiktokVideoUrl } = require('../../utils/checkUrl.js')
const { VideoTiktok } = require('../../models.js')
const { getVideoMetadata, sendVideoTelegram, sendVideoFromFileId } = require('./tiktokFunction.js')
const { removeFileAsync } = require("../../utils/fileUtils.js")








async function tiktokDownloader(bot, chatId, botName, tiktokDownloaderScene) {

    tiktokDownloaderScene.hears(/.*/, async (ctx) => {
        try {
            if (ctx.chat.id === chatId) {
                let videoUrl = ctx.message.text

                // videoUrl = 'https://vt.tiktok.com/ZS8Ww4rvV/'
                // videoUrl = 'https://www.tiktok.com/@vancityreynolds/video/7231232190019898667?lang=en&source=h5_m'

                const { videoUrlId, videoFullUrl } = await checkTiktokVideoUrl(ctx, chatId, videoUrl)


                try {
                    const videoFile = await VideoTiktok.findOne({ where: { videoLink: videoFullUrl } })

                    if (!videoFile) {
                        console.log('Запись о файле не найдена в базе данных')

                        const { videoPath, videoTitle } = await getVideoMetadata(ctx, chatId, videoUrlId)
                        await ctx.reply(`Загрузка видео "${videoTitle.substr(0, 15)}.." началась, ожидайте`, { chatId });
                        const fileId = await sendVideoTelegram(ctx, videoPath, botName)
                        await VideoTiktok.create({ videoLink: videoFullUrl, fileVideoId: fileId, })

                        try {
                            await removeFileAsync(videoPath)
                            console.log("Файл удален успешно:", videoPath)
                        } catch (error) {
                            console.error("Ошибка при удалении файла:", error)
                        }

                        return console.log(`Файл ${videoTitle} отправлен в чат ${chatId}`)

                    }
                    const telegramFile = await bot.telegram.getFile(videoFile.fileVideoId)

                    if (telegramFile) {
                        await sendVideoFromFileId(ctx, videoFile.fileVideoId, botName)
                    }
                } catch (error) {
                    await VideoTiktok.destroy({ where: { videoLink: videoFullUrl } })
                    const { videoPath, videoTitle } = await getVideoMetadata(ctx, chatId, videoUrlId)
                    await ctx.reply(`Загрузка видео "${videoTitle.substr(0, 15)}.." началась, ожидайте`, { chatId });

                    const fileId = await sendVideoTelegram(ctx, videoPath, botName)

                    await VideoTiktok.create({ videoLink: videoFullUrl, fileVideoId: fileId, })

                    try {
                        await removeFileAsync(videoPath)
                        console.log("Файл удален успешно:", videoPath)
                    } catch (error) {
                        console.error("Ошибка при удалении файла:", error)
                    }

                    console.error(`Ошибка при получении файла ${videoTitle}:`, error);
                }
            }
        } catch (error) {
            console.error('Произошла ошибка глобального try/catch (tiktokDownloader):', error);
        }
    })

}






module.exports = { tiktokDownloader }