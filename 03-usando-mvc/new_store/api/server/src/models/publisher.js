'use strict';
module.exports = (sequelize, DataTypes) => {
  const Publisher = sequelize.define('Publisher', {
    name: DataTypes.STRING,
    address: DataTypes.STRING
  }, {});
  Publisher.associate = function(models) {
    Publisher.hasMany(models.Book)
  };

  return Publisher;
};
