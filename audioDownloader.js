const botName = '@AudioVisualGenieBot';
const fs = require('fs');

const audioDownloader = async (bot, chatId, filePath) => {
  try {
    const fileStats = fs.statSync(filePath);
    const response = await bot.sendAudio(chatId, filePath, {
      caption: botName,
      contentType: 'audio/mpeg', // явно указываем тип контента
      fileSize: fileStats.size // явно указываем размер файла
    });
    console.log('Audio file uploaded');
    // fs.unlinkSync(filePath);
  } catch (error) {
    console.log('Error uploading audio file:', error);
  }
};

module.exports = { audioDownloader };

  

