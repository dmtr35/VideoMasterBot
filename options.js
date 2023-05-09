module.exports = {
  startOptions: {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: 'скачать аудио', callback_data: 'download audio' }],
        [{ text: 'редактировать видео-аудио', callback_data: 'edit video audio' }],
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



