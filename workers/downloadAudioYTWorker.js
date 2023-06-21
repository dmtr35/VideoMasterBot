const { parentPort, workerData, } = require('node:worker_threads')
const { videoUrl, fileName, options } = workerData
const youtubedl = require('youtube-dl-exec')



function downloadAudioYTWorker(videoUrl, fileName, options) {
    const outputFilePath = `./downloads/${fileName}`

    const defaultOptions = {
        noCheckCertificate: true,
        noWarnings: true,
        preferFreeFormats: true,
        addHeader: ["referer:youtube.com", "user-agent:googlebot"],
        output: outputFilePath,
        ffmpegLocation: "/usr/bin/ffmpeg",
    }

    const mergedOptions = { ...defaultOptions, ...options }

    return youtubedl(videoUrl, mergedOptions)
        .then(() => {
            console.log("File downloaded successfully")
            return outputFilePath
        })
        .catch((err) => {
            console.error("Error downloading file:", err)
            throw new Error('File download failed')
        })
}



downloadAudioYTWorker(videoUrl, fileName, options)
    .then((result) => {
        parentPort.postMessage(result)
    })
    .catch((error) => {
        parentPort.postMessage({ error: error.message })
    });