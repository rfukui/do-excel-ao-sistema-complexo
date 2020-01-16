import fs from 'fs'
import path from 'path'
import Sequelize from 'sequelize'
import configJson from '../config/config'

const sequelizeHistory = require('sequelize-history');
const basename = path.basename(__filename)
const env = process.env.NODE_ENV ? process.env.NODE_ENV : 'development'

const config = configJson[env]

console.log('this is the environment: ', env)

const db = {}

let sequelize
if (config.environment === 'production') {
  sequelize = new Sequelize(
      process.env[config.use_env_variable], config
    )
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS, {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'postgres',
      dialectOption: {
        ssl: true,
        native: true
      },
      logging: true
    }
  )
} else {
  sequelize = new Sequelize(
     config.database, config.username, config.password, config
  )
}
const { Author, AuthorHistory } = sequelize.import('./author')
const { User, UserHistory } = sequelize.import('./user')
const { Publisher, PublisherHistory } = sequelize.import('./publisher')

const models = {
  Author,
  AuthorHistory,
  Publisher,
  PublisherHistory,
  User,
  UserHistory
}

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

const trackAll = require('sequelize-history').all
trackAll(sequelize)
export default db
