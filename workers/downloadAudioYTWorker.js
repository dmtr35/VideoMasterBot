const { parentPort, workerData, } = require('node:worker_threads')
const { videoUrl, fileName } = workerData
const youtubedl = require('youtube-dl-exec')





function downloadAudioYTWorker(videoUrl, fileName) {
    const outputFilePath = `./downloads/${fileName}`

    const options = {
        noCheckCertificate: true,
        noWarnings: true,
        preferFreeFormats: true,
        addHeader: ["referer:youtube.com", "user-agent:googlebot"],
        extractAudio: true,
        audioFormat: "mp3",
        audioMultistreams: true,
        audioQuality: "48K",
        output: outputFilePath,
        ffmpegLocation: "/usr/bin/ffmpeg",
    };

    return youtubedl(videoUrl, options)
        .then(() => {
            console.log("File downloaded successfully")
            return outputFilePath
        })
        .catch((err) => {
            console.error("Error downloading file:", err)
            throw new Error('File download failed')
        });
}

downloadAudioYTWorker(videoUrl, fileName)
    .then((result) => {
        parentPort.postMessage(result)
    })
    .catch((error) => {
        parentPort.postMessage({ error: error.message })
    });