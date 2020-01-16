'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('BookHistories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      modelId: {
          type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING
      },
      isbn: {
        type: Sequelize.STRING
      },
      buyValue: {
        type: Sequelize.DECIMAL(10,2)
      },
      sellValue: {
        type: Sequelize.DECIMAL(10,2)
      },
      createdAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      },
      archivedAt: {
        type: Sequelize.DATE
      },
      authorId: {
        type: Sequelize.INTEGER
      },
      publisherId: {
        type: Sequelize.INTEGER
      }

    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('BookHistories');
  }
};
