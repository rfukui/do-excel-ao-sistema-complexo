'use strict';
module.exports = (sequelize, DataTypes) => {
  const Author = sequelize.define('Author', {
    name: DataTypes.STRING,
    is_alive: DataTypes.BOOLEAN
  }, {});
  Author.associate = function(models) {
    Author.hasMany(models.Book)
  };
  return Author;
};
