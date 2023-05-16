const mageHandlers = new Map()
console.log('mageHandlers::', mageHandlers)


async function createmageHandlers(bot, chatId, messageAudioHandler) {
    await mageHandlers.set(chatId, messageAudioHandler)
    bot.on('message', messageAudioHandler)
}

async function removemageHandlers(bot, chatId) {
    await bot.removeListener('message', mageHandlers.get(chatId))
    mageHandlers.delete(chatId)
}








module.exports = { mageHandlers, createmageHandlers, removemageHandlers }
