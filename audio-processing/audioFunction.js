

async function sendAudioTelegram(bot, chatId, botName, filePath, fileStats) {
  await bot.sendAudio(chatId, filePath, {
    caption: botName,
    contentType: 'audio/mpeg',
    fileSize: fileStats.size
  })
}











module.exports = { sendAudioTelegram }
