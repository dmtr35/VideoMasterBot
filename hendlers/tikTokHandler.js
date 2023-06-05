const tiktokHandler = new Map();

async function createTiktokHandlers(bot, chatId, messageTiktokHandler) {
  tiktokHandler.set(chatId, messageTiktokHandler);
  bot.on('message', messageTiktokHandler);
}

async function removeTiktokHandlers(bot, chatId) {
  const messageTiktokHandler = tiktokHandler.get(chatId);
  if (messageTiktokHandler) {
    // bot.off('message', messageTiktokHandler);
    bot.removeListener('message', messageTiktokHandler);

    tiktokHandler.delete(chatId);
  }
}

module.exports = { tiktokHandler, createTiktokHandlers, removeTiktokHandlers };
