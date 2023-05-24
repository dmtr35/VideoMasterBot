const { AudioFile } = require("../../models.js")
const fs = require("fs")
const youtubedl = require("youtube-dl-exec")

async function sendAudioTelegram(bot, chatId, botName, audioLink, fileSize) {
  console.log("audioLink::", audioLink)
  const response = await bot.sendAudio(chatId, audioLink, {
    caption: botName,
    contentType: "audio/mpeg",
    fileSize: fileSize,
  })
  console.log("response.document.file_id::00", response.audio.file_id)
  console.log("audioLink:00:", audioLink)
  return response.audio.file_id
}

async function downloadYoutubedl(
  bot,
  chatId,
  botName,
  videoTitle,
  normalizedFilename,
  normalVideoUrl
) {
  await bot.sendMessage(
    chatId,
    `Загрузка видео "${videoTitle.substr(0, 15)}.." началась, ожидайте`
  )
  // console.log('botName::', botName)
  // console.log('videoTitle::', videoTitle)
  // console.log('normalizedFilename::', normalizedFilename)
  // console.log('normalVideoUrl::', normalVideoUrl)
  await youtubedl(normalVideoUrl, {
    noCheckCertificates: true,
    noWarnings: true,
    preferFreeFormats: true,
    addHeader: ["referer:youtube.com", "user-agent:googlebot"],
    extractAudio: true,
    audioFormat: "mp3",
    audioMultistreams: true,
    output: `./downloads/${normalizedFilename}`,
    ffmpegLocation: "/usr/bin/ffmpeg",
  })
    .then(async (output) => {
      console.log("tttttttttttt::")

      try {
        filePath = `./downloads/${normalizedFilename}`
        fileStats = fs.statSync(filePath)
        const fileSize = fileStats.size

        if (fileSize >= 50 * 1024 * 1024) {
          const fileSizeInMB = fileSize / 1048576
          const roundedFileSizeInMB = fileSizeInMB.toFixed(2)
          return bot.sendMessage(
            chatId,
            `Файл занимает ${roundedFileSizeInMB}Mb. Файлы свыше 50 Mb пока что не поддерживаются`
          )
        }

        const fileId = await sendAudioTelegram(
          bot,
          chatId,
          botName,
          filePath,
          fileSize
        )
        console.log("fileId::", fileId)
        await AudioFile.create({
          videoLink: normalVideoUrl,
          audioLink: fileId,
        })
        console.log("Audio file uploaded")

        await fs.unlink(filePath, (err) => {
          if (err) {
            console.error("Ошибка при удалении файла:", err)
          } else {
            console.log("Файл удален успешно:", filePath)
          }
        })
      } catch (error) {
        console.log("Error uploading audio file:", error)
      }
    })
    .catch(async (err) => {
      console.log("Error downloading audio file:", err)
      return bot.sendMessage(
        chatId,
        "Произошла ошибка при загрузке аудио файла, повторите попытку"
      )
    })
}

module.exports = { sendAudioTelegram, downloadYoutubedl }
