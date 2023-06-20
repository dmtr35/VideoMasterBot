module.exports = {
  startOptions: {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: 'скачать TikTok', callback_data: 'downloadTikTok' }],
        [{ text: 'скачать аудио YouTube', callback_data: 'downloadAudio' }],
      ]
    })
  },


  


}



