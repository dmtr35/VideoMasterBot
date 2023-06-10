const fs = require("fs")
const youtubedl = require("youtube-dl-exec")

const { AudioFile } = require("../../models.js")
const { removeFileAsync, checkSize } = require("../../utils/fileUtils.js")
const { updateSuccessfulRequestsAudioYT } = require("../../utils/userUtils.js")





async function sendAudioTelegram(ctx, normalizedFilename, botName, audioLink, fileSize) {
    const chatId = ctx.chat.id

    const response = await ctx.replyWithAudio({ source: audioLink }, {
        caption: botName,
        filename: normalizedFilename,
        contentType: "audio/mpeg",
        fileSize: fileSize
    })
    console.log("response.document.file_id::00", response.audio.file_id)

    await updateSuccessfulRequestsAudioYT(chatId)


    return response.audio.file_id;
}

async function sendAudioFromFileId(ctx, normalizedFilename, botName, audioLink, fileSize) {
    const chatId = ctx.chat.id

    const response = await ctx.replyWithAudio(audioLink, {
        caption: botName,
        filename: normalizedFilename,
        contentType: "audio/mpeg",
        fileSize: fileSize,
    })

    // await updateSuccessfulRequestsAudioYT(chatId)


    return response.audio.file_id
}





async function downloadYoutubedl(ctx, chatId, botName, videoTitle, normalizedFilename, normalVideoUrl) {
    try {
        await ctx.reply(`Загрузка видео "${videoTitle.substr(0, 15)}.." началась, ожидайте`, { chatId })

        await youtubedl(normalVideoUrl, {
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            addHeader: ["referer:youtube.com", "user-agent:googlebot"],
            extractAudio: true,
            audioFormat: "mp3",
            audioMultistreams: true,
            audioQuality: "48K",
            output: `./downloads/${normalizedFilename}`,
            ffmpegLocation: "/usr/bin/ffmpeg",
        })
            .then(async (output) => {
                try {
                    filePath = `./downloads/${normalizedFilename}`
                    fileStats = fs.statSync(filePath)
                    const fileSize = fileStats.size

                    if (fileSize >= 50 * 1024 * 1024) { await checkSize(fileSize) }

                    const fileId = await sendAudioTelegram(ctx, normalizedFilename, botName, filePath, fileSize)
                    await AudioFile.create({ videoLink: normalVideoUrl, audioLink: fileId, })
                    console.log("Audio file uploaded")

                    try {
                        await removeFileAsync(filePath)
                        console.log("Файл удален успешно:", filePath)
                    } catch (error) {
                        console.error("Ошибка при удалении файла:", error)
                    }
                } catch (error) {
                    console.log("Error uploading audio file:", error)
                }
            })
            .catch(async (err) => {
                console.log("Error downloading audio file:", err)
                return ctx.reply("Произошла ошибка при загрузке аудио файла, повторите попытку", { chatId })
            })
    } catch (error) {
        console.log("Произошла ошибка:", error);
        return ctx.reply("Произошла ошибка при загрузке видео, повторите попытку", { chatId });
    }
}

// function downloadFile(normalVideoUrl, normalizedFilename) {
//     return new Promise((resolve, reject) => {
//         youtubedl(normalVideoUrl, {
//             noCheckCertificates: true,
//             noWarnings: true,
//             preferFreeFormats: true,
//             addHeader: ["referer:youtube.com", "user-agent:googlebot"],
//             extractAudio: true,
//             audioFormat: "mp3",
//             audioMultistreams: true,
//             audioQuality: "48K",
//             output: `./downloads/${normalizedFilename}`,
//             ffmpegLocation: "/usr/bin/ffmpeg",
//         })
//             .then((output) => {
//                 resolve(output);
//             })
//             .catch((err) => {
//                 reject(err);
//             });
//     });
// }
  

module.exports = { sendAudioTelegram, sendAudioFromFileId, downloadYoutubedl }
