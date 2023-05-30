const unorm = require("unorm")
const { sendAudioFromFileId, downloadYoutubedl } = require("./audioFunction.js")
const { audioHandler, createAudioHandlers, removeAudioHandlers } = require("../../hendlers/audioHandler.js")
const { getCleanVideoLink } = require("../../utils/normalizeLink.js")
const { AudioFile } = require("../../models.js")
const youtubedl = require("youtube-dl-exec")

const botName = "скачано с помощью @MediaWizardBot"

const flags = {
  dumpSingleJson: true,
  noCheckCertificates: true,
  noWarnings: true,
  preferFreeFormats: true,
  addHeader: ["referer:youtube.com", "user-agent:googlebot"]
}

async function audioDownloader(bot, chatId) {
  let normalizedFilename
  let audioFile
  let videoTitle

  const messageAudioHandler = async ctx => {
    try {
      if (ctx.chat.id === chatId) {
        // проверяем, что сообщение от того же пользователя, которому отправили запрос
        const text = ctx.message.text
        if (text === "/start" || text === "/info") {
          return removeAudioHandlers(bot, chatId)
        }



        const videoUrl = ctx.message.text;
        // console.log("videoUrl::", videoUrl)
        const normalVideoUrl = await getCleanVideoLink(ctx, chatId, videoUrl)
        // console.log("normalVideoUrl:33:", normalVideoUrl)
        // console.log("flags:33:", flags)




        await youtubedl(normalVideoUrl, flags)
          .then(async output => {
            const authorName = output.uploader
            videoTitle = output.title
            let filename = `${authorName}-${videoTitle}`
              .replace(/[/\\?%*:|"<>]/g, "")
              .replace(/"/g, "'")
              .substr(0, 64)
            normalizedFilename = unorm.nfc(`${filename}.mp3`)
            console.log("normalizedFilename:99:", normalizedFilename)
          })
          .catch(error => {
            console.log("error:", error)
          })
        console.log("normalizedFilename:55:", normalizedFilename)





        try {
          audioFile = await AudioFile.findOne({ where: { videoLink: normalVideoUrl } })
          // console.log("normalVideoUrl:66:", normalVideoUrl)

          // console.log("audioFile::", audioFile.audioLink)
          if (!audioFile) {
            console.log('Запись о файле не найдена в базе данных');
            await downloadYoutubedl(ctx, chatId, botName, videoTitle, normalizedFilename, normalVideoUrl)

            return console.log(`Файл ${normalizedFilename} отправлен в чат ${chatId}`)

          }

          const telegramFile = await bot.telegram.getFile(audioFile.audioLink)

          if (telegramFile) {
            const fileSize = telegramFile.file_size
            await sendAudioFromFileId(ctx, normalizedFilename, botName, audioFile.audioLink, fileSize)
          }
        } catch (error) {
          await AudioFile.destroy({ where: { videoLink: normalVideoUrl } })
          await downloadYoutubedl(ctx, chatId, botName, videoTitle, normalizedFilename, normalVideoUrl)
          console.error('Ошибка при получении файла:', error);
        }
      }
    } catch (error) {
      console.error('Произошла ошибка глобального try/catch:', error);
    }
  }

  if (!audioHandler.has(chatId)) {
    createAudioHandlers(bot, chatId, messageAudioHandler)
  }
}


module.exports = { audioDownloader }
