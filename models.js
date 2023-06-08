const sequelize = require('./db')
const { DataTypes } = require('sequelize')




const User = sequelize.define('user', {
  chatId: { type: DataTypes.INTEGER, primaryKey: true, unique: true },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
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







