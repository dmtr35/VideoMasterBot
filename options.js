module.exports = {
  startOptions: {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: 'скачать TikTok', callback_data: 'downloadTikTok' }],
        [{ text: 'скачать аудио', callback_data: 'downloadAudio' }],
      ]
    })
  },

  qualityOptions: {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: 'mp3', callback_data: 'mp3' }, { text: '480p', callback_data: '480p' }, { text: '720p', callback_data: '720p' }],
      ]
    })
  },






}



