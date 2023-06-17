const fs = require("fs")
const path = require('path')


const { AudioFile } = require("../../models.js")
const { removeFileAsync, removeFilesAsync, checkSize } = require("../../utils/fileUtils.js")
const { createWorkerAndDownload } = require("../../workers/workerUtils.js")
const { sendAudioTelegram, sendAudioFromFileId } = require('../../utils/telegramFunctions.js')
const { cutAudioFile } = require('../../utils/cutFile.js')





const workerPath = path.join(__dirname, '../../workers/downloadAudioYTWorker.js')
let pathsArray = []
let namesArray = []



async function downloadYoutubedl(ctx, botName, videoTitle, normalizedFilename, normalVideoUrl) {
    try {
        const chatId = ctx.chat.id
        await ctx.reply(`Загрузка видео "${videoTitle.substr(0, 15)}.." началась, ожидайте`, { chatId });

        createWorkerAndDownload(normalVideoUrl, normalizedFilename, workerPath)
            .then(async (filePath) => {

                // Продолжайте обработку в основном потоке
                fileStats = fs.statSync(filePath)
                const fileSize = fileStats.size

// --------------------------------------------------------------------------------
                // const fileSizeBig = 58173069
                // filePath = `./downloads/Kendra's_Language_School_Тренируйте_навык_слушания_разговорного_.mp3`
                // normalizedFilename = `Kendra's_Language_School_Тренируйте_навык_слушания_разговорного_.mp3`
// --------------------------------------------------------------------------------

                

                if (fileSize >= 1 * 1024 * 1024) {
                    const result = await cutAudioFile(filePath, normalizedFilename, fileSize)
                    pathsArray.push(...result[0])
                    namesArray.push(...result[1])
                } else {
                    pathsArray.push(filePath)
                    namesArray.push(normalizedFilename)
                }

                console.log("pathsArray:1:", pathsArray)
                console.log("namesArray:1:", namesArray)

                const fileId = await sendAudioTelegram(ctx, pathsArray, namesArray, botName)
                console.log('fileId::', fileId)
                await AudioFile.create({ videoLink: normalVideoUrl, audioLink: fileId })
                console.log("Audio file uploaded")

                try {
                    await removeFilesAsync(pathsArray)
                    console.log("Файл удален успешно:", filePath)
                } catch (error) {
                    console.error("Ошибка при удалении файла:", error)
                }
            })
            .catch((error) => {
                console.error("Error downloading file:", error);
                // Обработайте ошибку в основном потоке
            })
    } catch (error) {
        console.log("Error uploading audio file:", error);
        return ctx.reply("Произошла ошибка при загрузке аудио файла, повторите попытку", { chatId });
    }
}









module.exports = { sendAudioTelegram, sendAudioFromFileId, downloadYoutubedl }
