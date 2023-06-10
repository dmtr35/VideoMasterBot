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

const checkSize = async (fileSize) => {
  const fileSizeInMB = fileSize / 1048576
  const roundedFileSizeInMB = fileSizeInMB.toFixed(2)
  return ctx.reply(`Файл занимает ${roundedFileSizeInMB}Mb. Файлы свыше 50 Mb пока что не поддерживаются`, { chatId })
}


module.exports = { removeFileAsync, checkSize }
