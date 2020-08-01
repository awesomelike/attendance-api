module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Assistants', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    professorId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'Professors',
        key: 'id',
      },
    },
    accountId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'Accounts',
        key: 'id',
      },
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.fn('now'),
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.fn('now'),
    },
  }),
  down: (queryInterface) => queryInterface.dropTable('Assistants'),
};
