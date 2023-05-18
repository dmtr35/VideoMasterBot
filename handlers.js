const audioHandler = new Map()
// console.log('audioHandler::', audioHandler)


async function createmageHandlers(bot, chatId, messageAudioHandler) {
    await audioHandler.set(chatId, messageAudioHandler)
    bot.on('message', messageAudioHandler)
}

async function removemageHandlers(bot, chatId) {
    await bot.removeListener('message', audioHandler.get(chatId))
    audioHandler.delete(chatId)
}








module.exports = { audioHandler, createmageHandlers, removemageHandlers }
