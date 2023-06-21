module.exports = {
  startOptions: {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: 'скачать TikTok / YouTube Shorts', callback_data: 'downloadTikTok' }],
        [{ text: 'скачать аудио YouTube ролика', callback_data: 'downloadAudio' }],
      ]
    })
  },


  


}



