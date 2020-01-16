'use strict';
const sequelizeHistory = require('sequelize-history');

const Author = (sequelize, DataTypes) => {
  const Author = sequelize.define('Author', {
    name: DataTypes.STRING,
    is_alive: DataTypes.BOOLEAN
  }, {});
  Author.associate = function(models) {
    Author.hasMany(models.Book)
  };
  const AuthorHistory= sequelizeHistory(Author, sequelize)

  return { Author, AuthorHistory };
};

module.exports = Author
