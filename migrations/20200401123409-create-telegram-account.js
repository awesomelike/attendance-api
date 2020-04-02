module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('TelegramAccounts', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    studentId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'Students',
        key: 'id',
      },
    },
    phoneNumber: {
      type: Sequelize.STRING,
    },
    chatId: {
      type: Sequelize.INTEGER,
    },
    username: {
      type: Sequelize.STRING,
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
  down: (queryInterface) => queryInterface.dropTable('TelegramAccounts'),
};
