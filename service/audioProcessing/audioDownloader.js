const unorm = require("unorm")
const youtubedl = require("youtube-dl-exec")

const { sendAudioFromFileId, downloadYoutubedl } = require("./audioFunction.js")
const { checkYoutubeVideoUrl } = require("../../utils/checkUrl.js")
const { AudioFile } = require("../../models.js")
const { sendAudioTelegram } = require("./audioFunction.js")

const fs = require("fs")
const path = require('path')

const flags = {
  dumpSingleJson: true,
  noCheckCertificates: true,
  noWarnings: true,
  preferFreeFormats: true,
  addHeader: ["referer:youtube.com", "user-agent:googlebot"]
}

async function audioDownloader(bot, botName, audioDownloaderScene) {

  audioDownloaderScene.hears(/.*/, async (ctx) => {
    const chatId = ctx.chat.id

    try {
      let audioFile
      let videoTitle
      const videoUrl = ctx.message.text;
      let normalVideoUrl = await checkYoutubeVideoUrl(ctx, videoUrl)

      await youtubedl(normalVideoUrl, flags)
        .then(async output => {
          const authorName = output.uploader
          videoTitle = output.title
          let filename = `${authorName}_${videoTitle}`
            .replace(/[/\\?%*:|",.<>#]/g, "")
            .replace(/ /g, "_")
            .substr(0, 64)
          normalizedFilename = unorm.nfc(`${filename}.mp3`)
        })
        .catch(error => {
          console.log("error:", error)
        })

        console.log("normalizedFilename:", normalizedFilename)

      try {
        // normalVideoUrl = `https://www.youtube.com/shorts/KDsqyz1M-HA`
        // normalizedFilename = `Kendra's_Language_School_Тренируйте_навык_слушания_разговорного_XXX.mp3`
        audioFile = await AudioFile.findOne({ where: { videoLink: normalVideoUrl } })
        // audioFile = `CQACAgIAAxkDAAIYCmSNpju0qeRVFbxiC4KRrhQ4oDZ-AAIcMgACnWBwSJBUk9f1Ixj5LwQ`
        if (!audioFile) {
          console.log('Запись о файле не найдена в базе данных');
          await downloadYoutubedl(ctx, botName, videoTitle, normalizedFilename, normalVideoUrl)
          return console.log(`Файл ${normalizedFilename} отправлен в чат ${chatId}`)
        }
        const audioIds = audioFile.audioLink.split(' ')


        // =======================================================================
        const results = await Promise.all(
          audioIds.map(async (audioId) => {
            const telegramFile = await bot.telegram.getFile(audioId)
            return Boolean(telegramFile)
          })
        )
        if (results.every((result) => result)) {
          await sendAudioFromFileId(ctx, audioIds, normalizedFilename, botName)
        }
        // =======================================================================
        // const telegramFile = await bot.telegram.getFile(audioFile.audioLink)
        // const telegramFile = await bot.telegram.getFile(audioFile)
        // console.log("allFilesValid:", allFilesValid)

        // if (allFilesValid) {
        //   const fileSize = telegramFile.file_size
        //   await sendAudioFromFileId(ctx, normalizedFilename, botName, audioFile.audioLink, fileSize)
        // }
      } catch (error) {
        // await AudioFile.destroy({ where: { videoLink: normalVideoUrl } })
        // CQACAgIAAxkDAAIYCmSNpju0qeRVFbxiC4KRrhQ4oDZ-AAIcMgACnWBwSJBUk9f1Ixj5LwQ CQACAgIAAxkDAAIYC2SNpjsmSYKcid20tvPmOybLAAFFjAACHTIAAp1gcEgbK9M3at_N3C8E


        // await downloadYoutubedl(ctx, botName, videoTitle, normalizedFilename, normalVideoUrl)
        console.error('Ошибка при получении файла:', error)
      }

    } catch (error) {
      console.error('Произошла ошибка глобального try/catch (audioDownloader):', error)
    }
  })





}


module.exports = { audioDownloader }



// CQACAgIAAxkDAAIXV2SMaunctPqQfA5MzjWHMoO52GifAAJ_LAACjelgSD9nr0CwONwsLwQ CQACAgIAAxkDAAIXWGSMau39NuNYB3dgb57qfn0_8DiSAAKALAACjelgSEQzFPhvRvAuLwQ
