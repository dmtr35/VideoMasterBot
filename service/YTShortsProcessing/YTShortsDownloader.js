
const path = require('path')
const fs = require("fs")

const { VideoTiktok } = require('../../models.js')
const { removeFileAsync, checkSize } = require("../../utils/fileUtils.js")
const { createWorkerAndDownload } = require("../../workers/workerUtils.js")
const { sendVideoTelegram, sendVideoFromFileId } = require('../../utils/telegramFunctions.js')
const { youtubedlInfo } = require('../../utils/youtube.js')

const { langObject } = require('../../langObject.js')

require('dotenv').config()

const videoOptions = {
    format: "bestvideo[height=480][ext=mp4]+bestaudio[ext=m4a]/best[height=720][ext=mp4]/best[ext=mp4]",
}

const workerPath = path.join(__dirname, '../../workers/downloadAudioYTWorker.js')
const mp4 = '.mp4'





async function downloadYoutubedlShorts(ctx, videoFullUrl, message_id) {
    const chatId = ctx.chat.id
    const userLanguage = ctx.language

    try {
        await ctx.telegram.editMessageText(chatId, message_id, message_id, langObject[userLanguage].video_download_started)

        const { normalizedFilename } = await youtubedlInfo(videoFullUrl, mp4)

        createWorkerAndDownload(videoFullUrl, normalizedFilename, workerPath, videoOptions)
            .then(async (filePath) => {
                console.log('filePath::', filePath)
                fileStats = fs.statSync(filePath)
                const fileSize = fileStats.size

                if (fileSize >= 50 * 1024 * 1024) { return checkSize(ctx, fileSize, message_id) }

                await ctx.telegram.editMessageText(chatId, message_id, message_id, langObject[userLanguage].file_downloaded_processed_sending)
                const fileId = await sendVideoTelegram(ctx, filePath)
                console.log('fileId::', fileId)
                await VideoTiktok.create({ videoLink: videoFullUrl, fileVideoId: fileId })

                console.log("Audio file uploaded")
                await ctx.telegram.editMessageText(chatId, message_id, message_id, langObject[userLanguage].all_is_ready)

                try {
                    await removeFileAsync(filePath)
                    console.log("Файл удален успешно:", filePath)
                } catch (error) {
                    console.error("Ошибка при удалении файла:", error)
                }
            })
            .catch((error) => {
                console.error("Error downloading file:", error);
            })
    } catch (error) {
        console.log("Error uploading audio file:", error);
        return ctx.telegram.editMessageText(chatId, message_id, message_id, langObject[userLanguage].invalid_download_video)
    }
}









module.exports = { downloadYoutubedlShorts, sendVideoTelegram, sendVideoFromFileId }

