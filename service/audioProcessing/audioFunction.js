const fs = require("fs")
const path = require('path')


const { AudioFile } = require("../../models.js")
const { removeFilesAsync } = require("../../utils/fileUtils.js")
const { createWorkerAndDownload } = require("../../workers/workerUtils.js")
const { sendAudioTelegram, sendAudioFromFileId } = require('../../utils/telegramFunctions.js')
const { cutAudioFile } = require('../../utils/cutFile.js')





const workerPath = path.join(__dirname, '../../workers/downloadAudioYTWorker.js')
let pathsArray = []
let namesArray = []



async function downloadYoutubedl(ctx, botName, videoTitle, normalizedFilename, normalVideoUrl, message_id) {
    try {
        const chatId = ctx.chat.id

        await ctx.telegram.editMessageText(chatId, message_id, message_id, `Началась загрузка ролика ⏳`)
        createWorkerAndDownload(normalVideoUrl, normalizedFilename, workerPath)
            .then(async (filePath) => {

                fileStats = fs.statSync(filePath)
                const fileSize = fileStats.size

                if (fileSize >= 50 * 1024 * 1024) {
                    await ctx.telegram.editMessageText(chatId, message_id, message_id, `Файл слишком большой, режем на части 🪚`)

                    const result = await cutAudioFile(filePath, normalizedFilename, fileSize)
                    pathsArray.push(...result[0])
                    namesArray.push(...result[1])
                } else {
                    pathsArray.push(filePath)
                    namesArray.push(normalizedFilename)
                }

                await ctx.telegram.editMessageText(chatId, message_id, message_id, `Файл скачан и обработан, отправляем 💽`)
                const fileId = await sendAudioTelegram(ctx, pathsArray, namesArray, botName)
                console.log('fileId::', fileId)
                // await AudioFile.create({ videoLink: normalVideoUrl, audioLink: fileId })
                console.log("Audio file uploaded")
                await ctx.telegram.editMessageText(chatId, message_id, message_id, `Все готово ✅`)

                try {
                    await removeFilesAsync(pathsArray)
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
        return ctx.reply("Произошла ошибка при загрузке аудио файла, повторите попытку", { chatId });
    }
}









module.exports = { sendAudioTelegram, sendAudioFromFileId, downloadYoutubedl }
