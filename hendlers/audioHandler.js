const audioHandler = new Map()


async function createAudioHandlers(bot, chatId, messageAudioHandler) {
    await audioHandler.set(chatId, messageAudioHandler)
    bot.on('message', messageAudioHandler)
}

async function removeAudioHandlers(bot, chatId) {
    await bot.removeListener('message', audioHandler.get(chatId))
    audioHandler.delete(chatId)
}








module.exports = { audioHandler, createAudioHandlers, removeAudioHandlers }
