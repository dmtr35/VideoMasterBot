const axios = require('axios')

const { updateFailedRequestsAudioYT, updateFailedRequestsVideoTT } = require('./dbUtils.js')





async function checkYoutubeVideoUrl(ctx, link) {
  const chatId = ctx.chat.id
  const regexString = 'https?://(?:www\\.)?(?:m\\.youtube\\.com/shorts/[A-Za-z0-9-_]{11}|m\\.youtube\\.com/watch\\?v=[A-Za-z0-9-_]{11}|youtube\\.com/shorts/[A-Za-z0-9-_]{11}|youtube\\.com/watch\\?v=[A-Za-z0-9-_]{11})';
  // const regexString = 'https?://(?:www\\.)?m\\.youtube\\.com/shorts/[A-Za-z0-9-_]{11}'
  // const regexString = 'https?://(?:www\\.)?m\\.youtube\\.com/watch\\?v=[A-Za-z0-9-_]{11}'
  // const regexString = 'https?://(?:www\\.)?youtube\\.com/shorts/[A-Za-z0-9-_]{11}'
  // const regexString = 'https?://(?:www\\.)?youtube\\.com/watch\\?v=[A-Za-z0-9-_]{11}';

  const regex = new RegExp(regexString)
  const match = await regex.exec(link)


  if (!match) {
    await updateFailedRequestsAudioYT(ctx)

    await ctx.telegram.sendMessage(chatId, 'Некорректная ссылка, попробуйде еще раз:')
    throw new Error('Некорректная ссылка на YouTube')
  }

  const videoUrl = match[0]

  return videoUrl.toString()
}






async function checkTiktokVideoUrl(ctx, urlTiktok) {
  const chatId = ctx.chat.id
  const regexString = 'https?://(?:www\\.)?tiktok\\.com/\\S*/video/(\\d+)|https?://(?:www\\.)?vm.tiktok\\.com/\\S*'
  const regex = new RegExp(regexString, 'gm')

  try {
    const response = await axios.get(urlTiktok)
    const responseHtml = response.data
    const match = await regex.exec(responseHtml);

    if (match) {
      const videoFullUrl = match[0]
      const videoUrlId = match[1]
      return { videoUrlId, videoFullUrl }
    } else {
      throw new Error('Ссылка не найдена!')
    }
  } catch (e) {
    await updateFailedRequestsVideoTT(ctx)

    await ctx.telegram.sendMessage(chatId, 'Некорректная ссылка TikTok, попробуйте еще раз:')
  }
}








module.exports = { checkYoutubeVideoUrl, checkTiktokVideoUrl }


