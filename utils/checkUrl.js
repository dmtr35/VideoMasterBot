const axios = require('axios')





async function checkYoutubeVideoUrl(ctx, chatId, link) {
  const regexString = 'https?://(?:www\\.)?(?:tiktok\\.com/\\S*/video/(\\d+)|vm.tiktok\\.com/\\S*|youtube\\.com/watch\\?v=([0-9a-zA-Z\\-_]{11})|youtube\\.com/shorts/([0-9a-zA-Z\\-_]{11}))';
  const regex = new RegExp(regexString)
  const match = await regex.exec(link)


  if (!match) {
    await ctx.telegram.sendMessage(chatId, 'Некорректная ссылка, попробуйде еще раз:')
    throw new Error('Некорректная ссылка на YouTube')
  }

  const videoUrl = match[0]

  return videoUrl.toString()
}






async function checkTiktokVideoUrl(ctx, chatId, urlTiktok) {
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
    await ctx.telegram.sendMessage(chatId, 'Некорректная ссылка TikTok, попробуйте еще раз:')
  }
}








module.exports = { checkYoutubeVideoUrl, checkTiktokVideoUrl }


