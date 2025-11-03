const axios = require('axios')
const { langObject } = require('../langObject.js')

const {
  updateSuccessfulRequestsAudioYT,
  updateSuccessfulRequestsVideoTT,
  updateFailedRequestsAudioYT,
  updateFailedRequestsVideoTT
} = require('./dbUtils.js')



async function checkYoutubeVideoUrl(ctx, link) {
  const regexString = 'https?://(?:www\\.)?(?:m\\.youtube\\.com/shorts/[A-Za-z0-9-_]{11}|m\\.youtube\\.com/watch\\?v=[A-Za-z0-9-_]{11}|youtube\\.com/shorts/[A-Za-z0-9-_]{11}|youtube\\.com/watch\\?v=[A-Za-z0-9-_]{11})';

  const regex = new RegExp(regexString)
  const match = await regex.exec(link)

  if (!match) {
    await updateFailedRequestsAudioYT(ctx)

    throw new Error('Некорректная ссылка на YouTube')
  }

  const videoUrl = match[0]

  await updateSuccessfulRequestsAudioYT(ctx)

  return videoUrl.toString()
}



async function checkTiktokVideoUrl(ctx, urlTiktok, message_id) {
  const chatId = ctx.chat.id;
  const userLanguage = ctx.language;

  const regexString =
    'https?://(?:www\\.)?(?:m\\.youtube\\.com/shorts/[A-Za-z0-9-_]{11}|youtube\\.com/shorts/[A-Za-z0-9-_]{11}|tiktok\\.com/\\S*/video/(\\d+)|vm\\.tiktok\\.com/\\S*)';
  const regex = new RegExp(regexString, 'gm');

  try {
    // Разрешаем редиректы (по умолчанию 5)
    const response = await axios.get(urlTiktok, {
      maxRedirects: 5,
      validateStatus: () => true, // чтобы не выбрасывал ошибку на 301
    });

    // Берём конечный URL после редиректов
    const finalUrl =
      response.request?.res?.responseUrl ||
      response.request?._redirectable?._currentUrl ||
      urlTiktok;

    console.log("Resolved TikTok URL:", finalUrl);

    const match = regex.exec(finalUrl);

    if (match) {
      const videoFullUrl = match[0];
      const videoUrlId = match[1];

      await updateSuccessfulRequestsVideoTT(ctx);

      return { videoUrlId, videoFullUrl };
    } else {
      throw new Error("Ссылка не найдена!");
    }
  } catch (e) {
    console.error("TikTok check error:", e);
    await updateFailedRequestsVideoTT(ctx);

    return ctx.telegram.editMessageText(
      chatId,
      message_id,
      message_id,
      langObject[userLanguage].error_video_link
    );
  }
}



module.exports = { checkYoutubeVideoUrl, checkTiktokVideoUrl }