const axios = require('axios')
const fs = require('fs')
const path = require('path')

const { updateSuccessfulRequestsVideoTT } = require("../../utils/userUtils.js")
const { removeFileAsync, checkSize } = require("../../utils/fileUtils.js")



require('dotenv').config()


let cookie = convertCookie(process.env.COOKIE)

function convertCookie(cookies) {
    try {
        return JSON.parse(cookies).map(x => `${x.name}=${x.value}`).join('; ')
    } catch (error) {
        return cookies
    }
}

const headers = {
    'user-agent': 'com.zhiliaoapp.musically/2022405010 (Linux; U; Android 7.1.2; en; ASUS_Z01QD; Build/N2G48H;tt-ok/3.12.13.1)',
    cookie
}


async function getVideoMetadata(ctx, chatId, videoUrlId) {
    console.log('videoUrlId::', videoUrlId)

    const { videoUrl, author, title, fileSize } = await getDownloadLink(videoUrlId)
    // console.log('videoUrl::', videoUrl)
    // console.log('author::', author)
    // console.log('title::', title)
    // console.log('size::', size)

    if (fileSize >= 50 * 1024 * 1024) { await checkSize(fileSize) }


    let processedAuthor = author.replace(/[^\w\s]/g, '')
    processedAuthor = processedAuthor.substring(0, 16)

    let processedTitle = title.split('#')[0]
    processedTitle = processedTitle.replace(/[^\w\s]/g, '')
    processedTitle = processedTitle.substring(0, 48)

    const videoTitle = `${processedAuthor}-${processedTitle}`


    try {
        console.log('videoUrl::', videoUrl)

        const { data } = await axios({
            url: videoUrl,
            method: 'GET',
            responseType: 'stream'
        })

        if (!fs.existsSync('downloads')) fs.mkdirSync('downloads')

        const writer = fs.createWriteStream(path.resolve('downloads', `${videoTitle}.mp4`))

        await new Promise((resolve, reject) => {
            data.pipe(writer)
                .on('finish', resolve)
                .on('error', reject)
        })

        return { videoPath: writer.path, videoTitle }
    } catch (error) {
        await ctx.telegram.sendMessage(chatId, 'Загрузка не удалась, попробуйте еще раз:')
        console.log(`[ ${videoTitle} got error while trying to get video data! ] ===== [skipped]`)
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





async function sendVideoTelegram(ctx, videoPath, botName) {
    const chatId = ctx.chat.id

    try {
        const response = await ctx.replyWithVideo({ source: videoPath }, {
            caption: botName,
        })

        await updateSuccessfulRequestsVideoTT(chatId)

        return response.video.file_id
    } catch (e) {
        console.log('ошибка ' + e)
    }
}

async function sendVideoFromFileId(ctx, fileId, botName) {
    const chatId = ctx.chat.id

    await ctx.replyWithVideo(fileId, {
        caption: botName,
    })

    // await updateSuccessfulRequestsVideoTT(chatId)

    return
}


module.exports = { getVideoMetadata, sendVideoTelegram, sendVideoFromFileId }
