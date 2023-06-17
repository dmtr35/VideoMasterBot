const util = require('util');
const exec = util.promisify(require('child_process').exec);




const cutAudioFile = async (filePath, baseName, fileSize) => {
    const maxChunkSize = 1 * 1024 * 1024
    const totalChunks = Math.ceil(fileSize / maxChunkSize)
  
    const duration = await getDuration(filePath)
    const chunkDuration = Math.ceil(duration / totalChunks)
  
    const chunksPuths = []
    const chunkNames = []
  
    try {
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const newName = `${chunkIndex + 1}.${baseName}`
        const chunkPath = `./downloads/${newName}`
        const start = chunkIndex * chunkDuration
  
        const command = `ffmpeg -i "${filePath}" -ss ${start} -t ${chunkDuration} -c copy -map_metadata 0 -metadata title="${newName}" "${chunkPath}"`

        await exec(command);
  
        chunksPuths.push(chunkPath)
        chunkNames.push(newName)
      }
    } catch (error) {
      console.error(`Ошибка при разрезании файла: ${error}`)
    }
    console.error(`chunksPuths::`, chunksPuths)
    console.error(`chunkNames::`, chunkNames)

    return [chunksPuths, chunkNames]
  }
  


  const getDuration = async (filePath) => {
    const command = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`;
  
    try {
      const { stdout } = await exec(command);
      return parseFloat(stdout);
    } catch (error) {
      console.error(`Ошибка при получении длительности видео: ${error}`);
      return 0;
    }
  };
  


  module.exports = { cutAudioFile }