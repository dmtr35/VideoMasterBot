const audioHandler = new Map();

async function createAudioHandlers(bot, chatId, messageAudioHandler) {
  audioHandler.set(chatId, messageAudioHandler);
  bot.on('message', messageAudioHandler);
}

async function removeAudioHandlers(bot, chatId) {
  const messageAudioHandler = audioHandler.get(chatId);
  if (messageAudioHandler) {
    bot.off('message', messageAudioHandler);
    audioHandler.delete(chatId);
  }
}

module.exports = { audioHandler, createAudioHandlers, removeAudioHandlers };
