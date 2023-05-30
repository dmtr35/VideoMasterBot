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




  module.exports = { removeFileAsync }
