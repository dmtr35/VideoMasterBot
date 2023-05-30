const fs = require('fs')
const unorm = require('unorm')
const { getCleanTiktokLink } = require('../../utils/normalizeLink.js')
const { tiktokHandler, createTiktokHandlers, removeTiktokHandlers } = require('../../hendlers/tikTokHandler.js')
const { User, AudioFile } = require('../../models.js')


const TikTokScraper = require('tiktok-scraper');


const botName = 'скачано с помощью @MediaWizardBot'
const token = process.env.TOKEN_BOT

// console.log('tiktokHandler::', tiktokHandler)
// const options = new chrome.Options();
// const driver = new Builder()
//     .forBrowser('chrome')
//     .setChromeOptions(options)
//     .build();



async function tiktokDownloader(bot, chatId) {
    let normalizeTikTokLink
    // console.log('bot:000:', bot)
    // console.log('chatId:000:', chatId)

    const messageTiktokHandler = async (ctx) => {
        console.log('start:000:')

        if (ctx.chat.id === chatId) { // проверяем, что сообщение от того же пользователя, которому отправили запрос
            const text = ctx.message.text
            if (text === '/start' || text === '/info') { return removeTiktokHandlers(bot, chatId) }
            console.log('text:1:', text)

            let videoUrl = ctx.message.text

            // videoUrl = 'https://vt.tiktok.com/ZS8Ww4rvV/'
            videoUrl = 'https://www.tiktok.com/@lenusya157/video/7222259760400174341?_r=1&_t=8bXAUEkKecj'
            // console.log('videoUrl:0:', videoUrl)
            // normalizeTikTokLink = await getCleanTiktokLink(videoUrl)
            // console.log('normalizeTikTokLink:', normalizeTikTokLink)

            //   const videoInfo = await ytdl.getInfo(normalVideoUrl)





            console.log('videoUrl:0:', videoUrl)

            const videoMeta = await TikTokScraper.getVideoMeta(videoUrl, {
                headers: {
                    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.80 Safari/537.36',
                    referer: 'https://www.tiktok.com/',
                    cookie: 'tt_webid_v2=689854141086886123'
                }
            });

            const videoDownloadUrl = videoMeta.collector[0].videoUrlNoWaterMark;
            // Здесь можно использовать пакет для загрузки видео, например axios или request

            console.log('Video download URL:', videoDownloadUrl);
                    // Здесь вы можете использовать выбранный вами пакет для загрузки видео




        }
    }

    console.log('tiktokHandler:000:', tiktokHandler)

    if (!tiktokHandler.has(chatId)) {
        createTiktokHandlers(bot, chatId, messageTiktokHandler)
    }
}



module.exports = { tiktokDownloader }


