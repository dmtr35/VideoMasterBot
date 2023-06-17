const fs = require("fs")






const removeFileAsync = async (path) => {
  return new Promise((resolve, reject) => {
    fs.rm(path, (err) => {
      if (err) {
        reject(err.message)
      } else {
        resolve()
      }
    })
  })
}


const removeFilesAsync = async (paths) => {
  try {
    await Promise.all(paths.map((path) => removeFileAsync(path)))
    console.log('Все файлы успешно удалены.')
  } catch (error) {
    console.error('Ошибка при удалении файлов:', error)
  }
}




const checkSize = async (ctx, fileSize) => {
  const chatId = ctx.chat.id
  const fileSizeInMB = fileSize / 1048576
  const roundedFileSizeInMB = fileSizeInMB.toFixed(2)
  return ctx.reply(`Файл занимает ${roundedFileSizeInMB}Mb. Файлы свыше 50 Mb пока что не поддерживаются`, { chatId })
}








module.exports = { removeFileAsync, removeFilesAsync, checkSize }
