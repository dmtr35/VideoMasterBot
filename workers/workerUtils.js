const { Worker } = require('node:worker_threads')




function createWorkerAndDownload(videoUrl, fileName, workerPath, options) {
    return new Promise((resolve, reject) => {
        const workerData = { videoUrl, fileName, options }

        if (options) {
            workerData.options = options
        }

        const worker = new Worker(workerPath, {
            workerData,
        })
        
        worker.on('message', (filePath) => {
            worker.terminate()
            resolve(filePath)
        });

        worker.on('error', (error) => {
            worker.terminate()
            reject(error)
        });

        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`))
            }
        })
    })
}





module.exports = { createWorkerAndDownload }
