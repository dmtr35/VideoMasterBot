const sequelize = require('./db')
const { DataTypes } = require('sequelize')




const User = sequelize.define('user', {
  chatId: { type: DataTypes.INTEGER, primaryKey: true, unique: true },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  role: { type: DataTypes.STRING, defaultValue: 'user' },
  language: { type: DataTypes.STRING, defaultValue: 'ru' },

  blocked: { type: DataTypes.BOOLEAN, defaultValue: false },
  blocked_until: { type: DataTypes.DATE, allowNull: true },

  successfulRequestsAudioYT: { type: DataTypes.INTEGER, defaultValue: 0 },
  failedRequestsAudioYT: { type: DataTypes.INTEGER, defaultValue: 0 },
  successfulRequestsVideoTT: { type: DataTypes.INTEGER, defaultValue: 0 },
  failedRequestsVideoTT: { type: DataTypes.INTEGER, defaultValue: 0 },

  lastRequestTimestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  lastTikTokRequestTimestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  lastYouTubeRequestTimestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },

  warningCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  lastWarningTimestamp: { type: DataTypes.INTEGER, allowNull: true }
})


const AudioFile = sequelize.define('audio_file', {
  videoLink: { type: DataTypes.STRING, primaryKey: true },
  audioLink: { type: DataTypes.STRING, allowNull: false },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
})

const VideoTiktok = sequelize.define('user_video', {
  videoLink: { type: DataTypes.STRING, primaryKey: true },
  fileVideoId: { type: DataTypes.STRING, allowNull: false },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
})





module.exports = {
  User, AudioFile, VideoTiktok
}







