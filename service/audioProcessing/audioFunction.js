const fs = require("fs")
const path = require('path')


const { AudioFile } = require("../../models.js")
const { removeFilesAsync } = require("../../utils/fileUtils.js")
const { createWorkerAndDownload } = require("../../workers/workerUtils.js")
const { sendAudioTelegram, sendAudioFromFileId } = require('../../utils/telegramFunctions.js')
const { cutAudioFile } = require('../../utils/cutFile.js')

const { langObject } = require('../../langObject.js')

const audioOptions = {
    extractAudio: true,
    audioFormat: "mp3",
    audioMultistreams: true,
    audioQuality: "128K",
}



const workerPath = path.join(__dirname, '../../workers/downloadAudioYTWorker.js')




async function downloadYoutubedl(ctx, normalizedFilename, normalVideoUrl, message_id) {
    try {
        const chatId = ctx.chat.id
        const userLanguage = ctx.language

        await ctx.telegram.editMessageText(chatId, message_id, message_id, langObject[userLanguage].video_download_started)
        
        let pathsArray = []
        let namesArray = []

        createWorkerAndDownload(normalVideoUrl, normalizedFilename, workerPath, audioOptions)
            .then(async (filePath) => {

                fileStats = fs.statSync(filePath)
                const fileSize = fileStats.size

                if (fileSize >= 50 * 1020 * 1020) {
                    await ctx.telegram.editMessageText(chatId, message_id, message_id, langObject[userLanguage].file_is_too_big_cut_it_into_pieces)

                    const result = await cutAudioFile(filePath, normalizedFilename, fileSize)
                    pathsArray.push(...result[0])
                    namesArray.push(...result[1])
                } else {
                    pathsArray.push(filePath)
                    namesArray.push(normalizedFilename)
                }
                
                await ctx.telegram.editMessageText(chatId, message_id, message_id, langObject[userLanguage].file_downloaded_processed_sending)

                const fileId = await sendAudioTelegram(ctx, pathsArray, namesArray)
                console.log('fileId::', fileId)
                await AudioFile.create({ videoLink: normalVideoUrl, audioLink: fileId })
                console.log("Audio file uploaded")
                await ctx.telegram.editMessageText(chatId, message_id, message_id, langObject[userLanguage].all_is_ready)

                try {
                    await removeFilesAsync(pathsArray)
                    console.log("Файл удален успешно:", filePath)
                } catch (error) {
                    console.error("Ошибка при удалении файла:", error)
                }
            })
            .catch((error) => {
                console.error("Error downloading file:", error)
            })
    } catch (error) {
        console.log("Error uploading audio file:", error)
        return ctx.reply(langObject[userLanguage].error_loading_audio_file_try_again, { chatId })
    }
}









module.exports = { sendAudioTelegram, sendAudioFromFileId, downloadYoutubedl }
