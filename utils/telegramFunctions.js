



async function sendAudioTelegram(ctx, pathsArray, namesArray, botName) {
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

async function sendAudioFromFileId(ctx, audioIds, normalizedFilename, botName, message_id) {
    const chatId = ctx.chat.id

    for (let i = 0; i < audioIds.length; i++) {
        const path = audioIds[i]
        const name = `${i + 1}.${normalizedFilename}`
    
        const response = await ctx.replyWithAudio(path, {
          caption: botName,
          filename: name,
          contentType: "audio/mpeg",
        })
    }
    await ctx.telegram.editMessageText(chatId, message_id, message_id, `Все готово ✅`)

    return 
}


// -----------------------------------------------------------------------------------------


async function sendVideoTelegram(ctx, videoPath, botName) {

    try {
        console.log("first:sendVideoTelegram:", new Date())


        const response = await ctx.replyWithVideo({ source: videoPath }, {
            caption: botName,
        })
        console.log("second:sendVideoTelegram:", new Date())


        return response.video.file_id
    } catch (e) {
        console.log('ошибка ' + e)
    }
}

async function sendVideoFromFileId(ctx, fileId, botName, message_id) {
    const chatId = ctx.chat.id

    
    await ctx.replyWithVideo(fileId, {
        caption: botName,
    })
    
    await ctx.telegram.editMessageText(chatId, message_id, message_id, `Все готово ✅`)
    return
}



module.exports = {
    sendAudioTelegram,
    sendAudioFromFileId,
    sendVideoTelegram,
    sendVideoFromFileId
}

