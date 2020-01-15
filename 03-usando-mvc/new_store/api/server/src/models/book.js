'use strict';
module.exports = (sequelize, DataTypes) => {
  const Book = sequelize.define('Book', {
    title: DataTypes.STRING,
    isbn: DataTypes.STRING,
    buyValue: DataTypes.DECIMAL(10,2),
    sellValue: DataTypes.DECIMAL(10,2)

  }, {});
  return Book;
};
