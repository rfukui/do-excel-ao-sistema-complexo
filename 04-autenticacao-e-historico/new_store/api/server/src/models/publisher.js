'use strict';
const sequelizeHistory = require('sequelize-history');

module.exports = (sequelize, DataTypes) => {
  const Publisher = sequelize.define('Publisher', {
    name: DataTypes.STRING,
    address: DataTypes.STRING
  }, {});
  Publisher.associate = function(models) {
    Publisher.hasMany(models.Book)
  };

  const PublisherHistory= sequelizeHistory(Publisher, sequelize)

  return { Publisher, PublisherHistory };

};
