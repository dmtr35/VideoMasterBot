const { User } = require("../models.js")


const updateSuccessfulRequestsAudioYT = async (ctx) => {
  const chatId = ctx.chat.id
  const user = await User.findOne({ where: { chatId } })
  if (user) {
    await user.increment('successfulRequestsAudioYT')
    user.lastRequestTimestamp = new Date()
    await user.save();
  }
}

const updateFailedRequestsAudioYT = async (ctx) => {
  const chatId = ctx.chat.id
  const user = await User.findOne({ where: { chatId } })
  if (user) {
    await user.increment('failedRequestsAudioYT')
    user.lastRequestTimestamp = new Date()
    await user.save();
  }
}





const updateSuccessfulRequestsVideoTT = async (ctx) => {
  const chatId = ctx.chat.id
  const user = await User.findOne({ where: { chatId } })
  if (user) {
    await user.increment('successfulRequestsVideoTT')
    user.lastRequestTimestamp = new Date()
    await user.save()
  }
}

const updateFailedRequestsVideoTT = async (ctx) => {
  const chatId = ctx.chat.id
  const user = await User.findOne({ where: { chatId } })
  if (user) {
    await user.increment('failedRequestsVideoTT')
    user.lastRequestTimestamp = new Date()
    await user.save()
  }
}


module.exports = {
  updateSuccessfulRequestsAudioYT,
  updateFailedRequestsAudioYT,
  updateSuccessfulRequestsVideoTT,
  updateFailedRequestsVideoTT
}






