













const messageDownloadTikTokLinkIds = []




const messageDownloadTikTok = async (ctx, messageDownloadTikTokLinkIds) => {

    for (const messageId of messageDownloadTikTokLinkIds) {
        await ctx.deleteMessage(messageId)
      }
    
  }






  module.exports = { messageDownloadTikTok, messageDownloadTikTokLinkIds }
