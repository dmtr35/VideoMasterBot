









// const messagesSubmitDelete = async (ctx, messagesSubmit) => {

//     for (const messageId of messagesSubmit) {
//         await ctx.deleteMessage(messageId)
//     }

// }



const messagesSubmitDelete = async (ctx, messagesSubmit) => {
    for (const messageId of messagesSubmit) {
        try {
            await ctx.deleteMessage(messageId)
            
            console.error(`messageSubmitIds:0:`, messageSubmitIds)

        } catch (error) {
            console.error(`Ошибка при удалении сообщения: ${error}`)
        }
    }
}


// const messagesSubmitDelete = async (ctx, messagesSubmit, messageSubmitIds) => {
//     for (const messageId of messagesSubmit) {
//         try {
//             await ctx.deleteMessage(messageId);
//             messageSubmitIds = messageSubmitIds.filter((item) => item.messageId !== messageId);
//             console.error(`messageSubmitIds::`, messageSubmitIds);
//         } catch (error) {
//             console.error(`Ошибка при удалении сообщения: ${error}`);
//         }
//     }
// }









module.exports = { messagesSubmitDelete }