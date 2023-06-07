const axios = require('axios')




async function getCleanVideoUrl(ctx, chatId, link) {
    // console.log('ctx::', ctx)
    // console.log('chatId::', chatId)
    // console.log('link::', link)
    if (!isValidUrl(link)) {
        console.log('Некорректная ссылка, попробуйде еще раз:')
        await ctx.telegram.sendMessage(chatId, 'Некорректная ссылка, попробуйде еще раз:')
        throw new Error('Некорректная ссылка22')
    }
    const url = new URL(link)
    const searchParams = new URLSearchParams(url.search);

    if (searchParams.has("list") || searchParams.has("index") || searchParams.has("t")) {
        searchParams.delete("t")
        searchParams.delete("index")
        searchParams.delete("list")
        url.search = searchParams.toString()
    }

    if (url.hostname === "youtu.be") {
        const videoId = url.pathname.substr(1)
        url.host = "www.youtube.com"
        url.pathname = "/watch"
        url.searchParams.set("v", videoId)
    }

    return url.toString()
}



async function checkTiktokUrl(ctx, chatId, urlTiktok) {
  
  let match = null
  let attempts = 3
  
  for (let i = 0; i < attempts; i++) {
    const response = await axios.get(urlTiktok)
    const responseHtml = response.data
  
    const regexString = 'https?://(?:www\\.)?tiktok\\.com/\\S*/video/(\\d+)|https?://(?:www\\.)?vm.tiktok\\.com/\\S*'
    const regex = new RegExp(regexString, 'gm')

    match = await regex.exec(responseHtml)
    console.log('match::', match[0])
    
    if (match !== null) {
      break
    }
  }

  if (match === null) {
    await ctx.telegram.sendMessage(chatId, 'Некорректная ссылка TikTok, попробуйте еще раз:')
    throw new Error('Ссылка не найдена!')
  }

  const videoFullUrl = match[0]
  const videoUrlId = match[1]
  return { videoUrlId, videoFullUrl }
}







function isValidUrl(string) {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}





// function isValidTikTokUrl(string) {
//     if (!isValidUrl(string)) {
//       return false; // Проверяем валидность URL-адреса
//     }
  
//     const lowerCaseString = string.toLowerCase();
//     if (lowerCaseString.includes('.tiktok.com/')) {
//       return true; // Проверяем, содержит ли URL-адрес слово "tiktok"
//     }
  
//     return false;
//   }
  
  
//   async function getCleanTiktokLink(ctx, chatId, link) {
//     if (!isValidTikTokUrl(link)) {
//       console.log('Некорректная ссылка TikTok, попробуйте еще раз:');
//       await ctx.telegram.sendMessage(chatId, 'Некорректная ссылка TikTok, попробуйте еще раз:');
//       throw new Error('Некорректная ссылка TikTok');
//     }
  
//     const tiktokUrl = new URL(link);
//     tiktokUrl.search = '';
  
//     return tiktokUrl.toString();
//   }
  






module.exports = { getCleanVideoUrl, checkTiktokUrl }
