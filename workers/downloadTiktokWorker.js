const { parentPort, workerData, } = require('node:worker_threads')
const { videoUrl, fileName } = workerData


const axios = require('axios')
const fs = require('fs')
const path = require('path')



function downloadVideo(videoUrl, fileName) {
  return new Promise((resolve, reject) => {
    axios({
      url: videoUrl,
      method: 'GET',
      responseType: 'stream'
    })
      .then(response => {
        if (!fs.existsSync('downloads')) { fs.mkdirSync('downloads') }

        const filePath = path.resolve('downloads', `${fileName}.mp4`)
        const writer = fs.createWriteStream(filePath)

        response.data.pipe(writer)

        writer.on('finish', () => resolve(filePath))
        writer.on('error', error => reject(error))
      })
      .catch(error => reject(error))
  })
}



downloadVideo(videoUrl, fileName)
  .then((result) => {
    parentPort.postMessage(result)
  })
  .catch((error) => {
    parentPort.postMessage({ error: error.message })
  })



