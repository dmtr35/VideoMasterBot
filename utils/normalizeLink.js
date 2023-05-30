const TikTokScraper = require('tiktok-scraper')



function isValidUrl(string) {
    try {
        new URL(string)
        return true
    } catch (_) {
        return false
    }
}


async function getCleanVideoLink(ctx, chatId, link) {
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



// async function getCleanTiktokLink(videoUrl) {
//     // Извлечь идентификатор видео из прямой ссылки
//     const videoId = videoUrl.replace('https://vt.tiktok.com/', '')

//     try {
//       // Получить метаданные видео по идентификатору
//       const videoMeta = await TikTokScraper.getVideoMeta(videoId)

//       // Вернуть объект с метаданными видео
//       return videoMeta.collector[0]
//     } catch (error) {
//       console.error('Can\'t extract video metadata:', videoUrl)
//       throw error
//     }
//   }






// module.exports = { getCleanVideoLink, getCleanTiktokLink }
module.exports = { getCleanVideoLink }
