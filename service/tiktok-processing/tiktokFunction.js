
const axios = require('axios')
const path = require('path')

const { VideoTiktok } = require('../../models.js')
const { removeFileAsync, checkSize } = require("../../utils/fileUtils.js")
const { createWorkerAndDownload } = require("../../workers/workerUtils.js")
const { sendVideoTelegram, sendVideoFromFileId } = require('../../utils/telegramFunctions.js')

const { langObject } = require('../../langObject.js')

require('dotenv').config()


const headers = {
    'user-agent': 'com.zhiliaoapp.musically/2022405010 (Linux; U; Android 7.1.2; en; ASUS_Z01QD; Build/N2G48H;tt-ok/3.12.13.1)',
    cookie: process.env.COOKIE_00
}

const workerPath = path.join(__dirname, '../../workers/downloadTiktokWorker.js')



async function getVideoMetadata(ctx, videoUrlId, videoFullUrl, message_id) {
    const chatId = ctx.chat.id
    const userLanguage = ctx.language
    let videoTitle

    try {
        console.log('videoUrlId::', videoUrlId)

        const { videoUrl, author, title, fileSize } = await getDownloadLink(videoUrlId)
        if (fileSize >= 50 * 1024 * 1024) { return checkSize(ctx, fileSize, message_id) }


        let processedAuthor = author
            .replace(/[/\\?%*:|"<>]/g, "")
            .replace(/"/g, "'")
            .substr(0, 20)
        console.log('processedAuthor:1:', processedAuthor)

        let processedTitle = title
            .replace(/[/\\?%*:|"<>]/g, "")
            .replace(/"/g, "'")
            .substr(0, 44)
        console.log('processedTitle:2:', processedTitle)


        videoTitle = `${processedAuthor}-${processedTitle}`

        await ctx.telegram.editMessageText(chatId, message_id, message_id, langObject[userLanguage].video_download_started)

        createWorkerAndDownload(videoUrl, videoTitle, workerPath)
            .then(async (filePath) => {

                await ctx.telegram.editMessageText(chatId, message_id, message_id, langObject[userLanguage].file_downloaded_processed_sending)

                const fileId = await sendVideoTelegram(ctx, filePath)
                await VideoTiktok.create({ videoLink: videoFullUrl, fileVideoId: fileId })
                await ctx.telegram.editMessageText(chatId, message_id, message_id, langObject[userLanguage].all_is_ready)

                try {
                    await removeFileAsync(filePath)
                    console.log("Файл удален успешно:", filePath)
                } catch (error) {
                    console.error("Ошибка при удалении файла:", error)
                }
                return console.log(`Файл ${videoTitle} отправлен в чат ${chatId}`)
            })
            .catch((error) => {
                console.error("Error downloading file:", error);
            })


    } catch (error) {
        console.log(`[ ${videoTitle} got error while trying to get video data! ] ===== [skipped]`)
        return ctx.telegram.editMessageText(chatId, message_id, message_id, langObject[userLanguage].download_failed_please_try_again)

    }
}





async function getDownloadLink(id) {
    const res = await axios.get('https://api2.musical.ly/aweme/v1/feed/?aweme_id=' + id, { headers })
    const filtered = res.data.aweme_list.find(x => x.aweme_id == id)
    return {
        videoUrl: filtered.video.play_addr.url_list[0],
        author: filtered.author.unique_id,
        title: filtered.desc,
        fileSize: filtered.video.play_addr.data_size
    }
}




module.exports = { getVideoMetadata, sendVideoTelegram, sendVideoFromFileId }

