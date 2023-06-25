const { langObject } = require('./langObject.js')



const getStartOptions = (ctx) => {
  const userLanguage = ctx.language

  const startOptions = {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: langObject[userLanguage].start, callback_data: 'downloadTikTok' }],
        [{ text: langObject[userLanguage].audio, callback_data: 'downloadAudio' }]
      ]
    })
  }


  return startOptions
}



const getLanguagesOptions = (ctx) => {
  const userLanguage = ctx.language

  const languagesOptions = {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [
          { text: langObject[userLanguage].english, callback_data: 'en' },
          { text: langObject[userLanguage].ukraine, callback_data: 'ua' },
          { text: langObject[userLanguage].russia, callback_data: 'ru' },
        ],
      ]
    })
  }


  return languagesOptions
}

module.exports = { getStartOptions, getLanguagesOptions }



