const youtubedl = require("youtube-dl-exec")
const unorm = require("unorm")










const flags = {
    dumpSingleJson: true,
    noCheckCertificates: true,
    noWarnings: true,
    preferFreeFormats: true,
    addHeader: ["referer:youtube.com", "user-agent:googlebot"]
}




async function youtubedlInfo(normalVideoUrl, format) {
    console.log("start", Date())
    try {
        let normalizedFilename

        await youtubedl(normalVideoUrl, flags)
            .then(async output => {
                const authorName = output.uploader
                videoTitle = output.title
                let filename = `${authorName}_${videoTitle}`
                    .replace(/[/\\?%*:|",.<>#]/g, "")
                    .replace(/ /g, "_")
                    .substr(0, 64)
                // normalizedFilename = unorm.nfc(`${filename}.mkv`)
                normalizedFilename = unorm.nfc(`${filename}${format}`)
                // normalizedFilename = unorm.nfc(`${filename}.mp3`)
            })
            .catch(error => {
                console.log("error:", error)
            })
            console.log("end", Date())
            
        return { normalizedFilename }

    } catch (error) {
        console.log("error:", error);
        throw error;
    }
}





module.exports = { youtubedlInfo }

