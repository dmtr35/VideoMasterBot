const { Worker } = require('node:worker_threads')




function createWorkerAndDownload(videoUrl, fileName, workerPath) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(workerPath, {
            workerData: { videoUrl, fileName },
        });
        
        worker.on('message', (filePath) => {
            worker.terminate()
            console.log('filePath:0:', filePath)
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
