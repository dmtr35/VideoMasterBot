const { sendAudioFromFileId, downloadYoutubedl } = require("./audioFunction.js")
const { checkYoutubeVideoUrl } = require("../../utils/checkUrl.js")
const { AudioFile } = require("../../models.js")
const { youtubedlInfo } = require('../../utils/youtube.js')


const mp3 = '.mp3'


async function audioDownloader(bot, botName, audioDownloaderScene) {

  audioDownloaderScene.hears(/.*/, async (ctx) => {
    const chatId = ctx.chat.id
    const { message_id } = await ctx.reply(`Обработка началась, ожидайте ⚙️`, { chatId })

    try {
      let audioFile
      const videoUrl = ctx.message.text;
      let normalVideoUrl = await checkYoutubeVideoUrl(ctx, videoUrl, message_id)

      const { normalizedFilename } = await youtubedlInfo(normalVideoUrl, mp3)

      try {
        audioFile = await AudioFile.findOne({ where: { videoLink: normalVideoUrl } })
        if (!audioFile) {
          console.log('Запись о файле не найдена в базе данных')

          await downloadYoutubedl(ctx, botName, normalizedFilename, normalVideoUrl, message_id)
          return console.log(`Файл ${normalizedFilename} отправлен в чат ${chatId}`)
        }

        const audioIds = audioFile.audioLink.split(' ')

        const results = await Promise.all(
          audioIds.map(async (audioId) => {
            const telegramFile = await bot.telegram.getFile(audioId)
            return Boolean(telegramFile)
          })
        )

        if (results.every((result) => result)) {
          await sendAudioFromFileId(ctx, audioIds, normalizedFilename, botName, message_id)
        }
      } catch (error) {
        await AudioFile.destroy({ where: { videoLink: normalVideoUrl } })
        await downloadYoutubedl(ctx, botName, normalizedFilename, normalVideoUrl, message_id)

        console.error('Ошибка при получении файла:', error)
      }

    } catch (error) {
      console.error('Произошла ошибка глобального try/catch (audioDownloader):', error)
      return ctx.telegram.editMessageText(chatId, message_id, message_id, `Загрузка не удалась, попробуйте еще раз:`)
    }
  })





}


module.exports = { audioDownloader }



// CQACAgIAAxkDAAIXV2SMaunctPqQfA5MzjWHMoO52GifAAJ_LAACjelgSD9nr0CwONwsLwQ CQACAgIAAxkDAAIXWGSMau39NuNYB3dgb57qfn0_8DiSAAKALAACjelgSEQzFPhvRvAuLwQ
