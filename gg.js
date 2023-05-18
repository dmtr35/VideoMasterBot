const fs = require('fs')
const youtubedl = require('youtube-dl-exec')
const ytdl = require('ytdl-core')
const unorm = require('unorm')
const { sendAudioTelegram, downloadAudioTelegram } = require('./audioFunction.js')
const { audioHandler, createmageHandlers, removemageHandlers } = require('../handlers.js')
const { getCleanVideoUrl } = require('../normalizeLink.js')
const { User, UserVideo, AudioFile } = require('../models.js')

const botName = 'скачано с помощью @AudioVisualGenieBot'
const token = process.env.TOKEN_BOT

// const audioHandler = new Map()




async function audioDownloader(bot, chatId) {
    let normalizedFilename
    let filePath
    let fileStats

    const messageAudioHandler = async (msg) => {
        if (msg.chat.id === chatId) { // проверяем, что сообщение от того же пользователя, которому отправили запрос
            const text = msg.text
            if (text === '/start' || text === '/info') { return removemageHandlers(bot, chatId) }

            const videoUrl = msg.text
            const normalVideoUrl = await getCleanVideoUrl(videoUrl)
            const { audioLink } = await AudioFile.findOne({ where: { videoLink: normalVideoUrl } });
            const { file_path: telegramFilePath } = await bot.getFile(audioLink);
            if (telegramFilePath) {
                sendAudioTelegram(bot, chatId, botName, audioLink);
            } else {
                try {
                    const videoInfo = await ytdl.getInfo(normalVideoUrl)

                    const authorName = videoInfo.videoDetails.author.name
                    const videoTitle = videoInfo.videoDetails.title
                    let filename = `${authorName}-${videoTitle}`.replace(/[/\\?%*:|"<>]/g, '').replace(/"/g, '\'').substr(0, 64)
                    normalizedFilename = unorm.nfc(`${filename}.mp3`)


                    await bot.sendMessage(chatId, `Загрузка видео "${videoTitle.substr(0, 15)}.." началась, ожидайте`)

                    // ===================================================================================
                    youtubedl(normalVideoUrl, {
                        noCheckCertificates: true,
                        noWarnings: true,
                        preferFreeFormats: true,
                        addHeader: [
                            'referer:youtube.com',
                            'user-agent:googlebot'
                        ],
                        extractAudio: true,
                        audioFormat: 'mp3',
                        audioMultistreams: true,
                        output: `./downloads/${normalizedFilename}`,
                        ffmpegLocation: '/usr/bin/ffmpeg'
                    }).then(async output => {
                        try {
                            filePath = `./downloads/${normalizedFilename}`;
                            fileStats = fs.statSync(filePath)
                            const fileId = await sendAudioTelegram(bot, chatId, botName, filePath, fileStats)
                            await AudioFile.create({ videoLink: normalVideoUrl, audioLink: fileId });
                            console.log('Audio file uploaded')
                            // fs.unlinkSync(filePath) // удалить загруженый файл
                        } catch (error) {
                            console.log('Error uploading audio file:', error)
                        }
                    }).catch(async err => {
                        console.log('Error downloading audio file:', err)
                        return bot.sendMessage(chatId, 'Произошла ошибка при загрузке аудио файла, повторите попытку')
                    })
                    // ===========================================================================


                    return console.log(`File ${normalizedFilename} sent to chat ${chatId}`)
                } catch (e) {
                    await bot.sendMessage(chatId, 'Не удалось найти видео по указанной ссылке. Пожалуйста, убедитесь, что вы ввели правильную ссылку и повторите попытку:')
                    return
                }

            }
        }
    }


    if (!audioHandler.has(chatId)) {
        createmageHandlers(bot, chatId, messageAudioHandler)
    }
}



module.exports = { audioDownloader }



