const sequelize = require('./db')
const { DataTypes } = require('sequelize')


const User = sequelize.define('user', {
    userId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    chatId: { type: DataTypes.STRING, unique: true },
})

// const Channel = sequelize.define('channel', {
//     channelId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
//     channelName: { type: DataTypes.STRING, allowNull: false },
//     subscribers: { type: DataTypes.STRING, allowNull: false },
//     timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
//     subscribersCount: { type: DataTypes.INTEGER, allowNull: false },
// })

// const Subscriber_new = sequelize.define('subscriber_new', {
//     subscriberId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
//     timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
//     subscribersCount: { type: DataTypes.INTEGER, allowNull: false },
//     subscribers: { type: DataTypes.STRING, allowNull: false },
// })





module.exports = {
    User,
}







