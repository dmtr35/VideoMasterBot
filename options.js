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
        [{ text: langObject[userLanguage].russia, callback_data: 'ru' }, { text: langObject[userLanguage].english, callback_data: 'en' }],
      ]
    })
  }


  return languagesOptions
}

module.exports = { getStartOptions, getLanguagesOptions }



