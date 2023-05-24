const tiktokHandler = new Map()


async function createTiktokHandlers(bot, chatId, messageTiktokHandler) {
    await tiktokHandler.set(chatId, messageTiktokHandler)
    bot.on('message', messageTiktokHandler)
}

async function removeTiktokHandlers(bot, chatId) {
    await bot.removeListener('message', tiktokHandler.get(chatId))
    tiktokHandler.delete(chatId)
}








module.exports = { tiktokHandler, createTiktokHandlers, removeTiktokHandlers }
