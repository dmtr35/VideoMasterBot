const sequelize = require('./db')
const { DataTypes } = require('sequelize')




const User = sequelize.define('user', {
  chatId: { type: DataTypes.INTEGER, primaryKey: true, unique: true },
})

const UserVideo = sequelize.define('user_video', {
  userVideoId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  link: { type: DataTypes.STRING, allowNull: false },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
})


const AudioFile = sequelize.define('audio_file', {
  audioFileId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  link: { type: DataTypes.STRING, allowNull: false },
})





User.hasMany(UserVideo, { onDelete: 'CASCADE' })
UserVideo.belongsTo(User)

User.belongsToMany(AudioFile, { through: 'UserAudioFile' })
AudioFile.belongsToMany(User, { through: 'UserAudioFile' })



module.exports = {
  User, UserVideo, AudioFile
}







