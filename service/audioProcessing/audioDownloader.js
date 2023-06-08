const unorm = require("unorm")
const youtubedl = require("youtube-dl-exec")

const { sendAudioFromFileId, downloadYoutubedl } = require("./audioFunction.js")
const { checkYoutubeVideoUrl } = require("../../utils/checkUrl.js")
const { AudioFile } = require("../../models.js")



const flags = {
  dumpSingleJson: true,
  noCheckCertificates: true,
  noWarnings: true,
  preferFreeFormats: true,
  addHeader: ["referer:youtube.com", "user-agent:googlebot"]
}

async function audioDownloader(bot, chatId, botName, audioDownloaderScene) {

  audioDownloaderScene.hears(/.*/, async (ctx) => {
    
    try {
      if (ctx.chat.id === chatId) {
        let normalizedFilename
        let audioFile
        let videoTitle
        const videoUrl = ctx.message.text;
        const normalVideoUrl = await checkYoutubeVideoUrl(ctx, chatId, videoUrl)

        await youtubedl(normalVideoUrl, flags)
          .then(async output => {
            const authorName = output.uploader
            videoTitle = output.title
            let filename = `${authorName}-${videoTitle}`
              .replace(/[/\\?%*:|"<>]/g, "")
              .replace(/"/g, "'")
              .substr(0, 64)
            normalizedFilename = unorm.nfc(`${filename}.mp3`)
          })
          .catch(error => {
            console.log("error:", error)
          })


        try {
          audioFile = await AudioFile.findOne({ where: { videoLink: normalVideoUrl } })
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
          console.error('Ошибка при получении файла:', error)
        }
      }

    } catch (error) {
      console.error('Произошла ошибка глобального try/catch (audioDownloader):', error)
    }
  })





}


module.exports = { audioDownloader }




