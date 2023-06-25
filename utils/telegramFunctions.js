const { langObject } = require('../langObject.js')




async function sendAudioTelegram(ctx, pathsArray, namesArray) {
    const userLanguage = ctx.language
    const botName = langObject[userLanguage].botName

    const fileIds = []

    for (let i = 0; i < pathsArray.length; i++) {
        const path = pathsArray[i]
        const name = namesArray[i]
    
        const response = await ctx.replyWithAudio({ source: path }, {
          caption: botName,
          filename: name,
          contentType: "audio/mpeg",
        })

        fileIds.push(response.audio.file_id)
    }

    const fileIdsString = fileIds.join(" ")

    return fileIdsString
}

async function sendAudioFromFileId(ctx, audioIds, normalizedFilename, message_id) {
    const chatId = ctx.chat.id
    const userLanguage = ctx.language
    const botName = langObject[userLanguage].botName

    for (let i = 0; i < audioIds.length; i++) {
        const path = audioIds[i]
        const name = `${i + 1}.${normalizedFilename}`
    
        const response = await ctx.replyWithAudio(path, {
          caption: botName,
          filename: name,
          contentType: "audio/mpeg",
        })
    }
    await ctx.telegram.editMessageText(chatId, message_id, message_id, langObject[userLanguage].all_is_ready)
    return 
}


// -----------------------------------------------------------------------------------------


async function sendVideoTelegram(ctx, videoPath) {
    const userLanguage = ctx.language
    const botName = langObject[userLanguage].botName

    try {
        const response = await ctx.replyWithVideo({ source: videoPath }, {
            caption: botName,
        })

        return response.video.file_id
    } catch (e) {
        console.log('ошибка ' + e)
    }
}

async function sendVideoFromFileId(ctx, fileId, message_id) {
    const chatId = ctx.chat.id
    const userLanguage = ctx.language
    const botName = langObject[userLanguage].botName
    
    await ctx.replyWithVideo(fileId, {
        caption: botName,
    })
    
    await ctx.telegram.editMessageText(chatId, message_id, message_id, langObject[userLanguage].all_is_ready)
    return
}



module.exports = {
    sendAudioTelegram,
    sendAudioFromFileId,
    sendVideoTelegram,
    sendVideoFromFileId
}

