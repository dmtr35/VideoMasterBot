// const { edit_audio } = require('./index.js');

const downloadAudio = async function (bot, chatId) {
    await bot.sendMessage(chatId, 'Введите ссылку на видео:')
}
// async function stopDownloadAudio(bot, chatId) {
//     await bot.removeListener('message', downloadAudio(chatId))
// }
async function stopDownloadAudio(bot, chatId) {
    await bot.removeListener('message', () => downloadAudio(bot, chatId));
}



// function downloadAudio(chatId) {
//     sessions[chatId] = { waitingForLink: true };
//     bot.on('message', linkHandler);
// }

// function editAudio(chatId) {
//     bot.removeListener('message', linkHandler);
//     // your code for editing audio
// }


module.exports = {
    downloadAudio,
    stopDownloadAudio,
    // stopEditAudio,
    // edit_audio
};
