const tiktokHandler = new Map();

async function createTiktokHandlers(bot, chatId, messageTiktokHandler) {
  tiktokHandler.set(chatId, messageTiktokHandler);
  bot.on('message', messageTiktokHandler);
}




async function removeTiktokHandlers(bot, chatId) {
  console.log('bot:00:', bot.handler)

  const messageTiktokHandler = tiktokHandler.get(chatId);
  if (messageTiktokHandler) {
    await bot.off('message', messageTiktokHandler);
    console.log('tiktokHandler:00:', tiktokHandler);
    tiktokHandler.delete(chatId);
  }
}


// async function removeTiktokHandlers(bot, chatId) {
//   const messageTiktokHandler = tiktokHandler.get(chatId);
//   if (messageTiktokHandler) {
//     // bot.off('message', messageTiktokHandler);
//     console.log('tiktokHandler:0:', tiktokHandler)
//     // bot.removeListener('message', messageTiktokHandler);
//     // messageTiktokHandler.off('message', messageTiktokHandler);
//     messageTiktokHandler.removeListener('message', messageTiktokHandler);

//     console.log('tiktokHandler:00:', tiktokHandler)

//     tiktokHandler.delete(chatId);
//   }
// }

module.exports = { tiktokHandler, createTiktokHandlers, removeTiktokHandlers };
