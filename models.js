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
});

// const UserVideo = sequelize.define('user_video', {
//   userVideoId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
//   videoLink: { type: DataTypes.STRING, allowNull: false },
//   timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
// })


// const AudioFile = sequelize.define('audio_file', {
//   videoLink: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
//   audioLink: { type: DataTypes.STRING, allowNull: false },
//   timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
// })





// User.hasMany(UserVideo, { onDelete: 'CASCADE' })
// UserVideo.belongsTo(User)

// User.belongsToMany(AudioFile, { through: 'UserAudioFile' })
// AudioFile.belongsToMany(User, { through: 'UserAudioFile' })



module.exports = {
  User, AudioFile
}







