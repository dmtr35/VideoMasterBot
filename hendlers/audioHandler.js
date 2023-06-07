


const audioHandler = new Map();

async function createAudioHandlers(bot, chatId, messageAudioHandler) {
  audioHandler.set(chatId, messageAudioHandler);
  bot.on('message', messageAudioHandler);
}



async function removeAudioHandlers(bot, chatId) {
  console.log('bot.handler:00:', bot.handler)

  const messageAudioHandler = audioHandler.get(chatId);
  if (messageAudioHandler) {
    await bot.removeListener('message', messageAudioHandler);
    console.log('audioHandler:00:', audioHandler);
    audioHandler.delete(chatId);
  }
}





// async function removeAudioHandlers(bot, chatId) {
//   const messageAudioHandler = audioHandler.get(chatId)
//   if (messageAudioHandler) {
//     console.log('audioHandler:0:', audioHandler)

//     // bot.removeListener('message', messageAudioHandler);
//     // messageAudioHandler.off('message', messageAudioHandler);
//     // messageAudioHandler.removeListener('message', messageAudioHandler);
//     await bot.removeListener('message', audioHandler.get(chatId))
//     console.log('audioHandler:00:', audioHandler)

//     audioHandler.delete(chatId);
//   }
// }



// async function removeAudioHandlers(bot, chatId) {
//   const messageAudioHandler = audioHandler.get(chatId);
//   if (messageAudioHandler) {
//     bot.removeTextListener('message', messageAudioHandler);
//     console.log('audioHandler:0:', audioHandler)

//     audioHandler.delete(chatId);
//   }
// }


// async function removeAudioHandlers(bot, chatId) {
//   await bot.removeListener('message', audioHandler.get(chatId))
//   audioHandler.delete(chatId)
// }




module.exports = { audioHandler, createAudioHandlers, removeAudioHandlers };

