module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('TelegramAccounts', {
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
        type: Sequelize.STRING(32),
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
    });
    await queryInterface.addConstraint('TelegramAccounts', ['phoneNumber'], {
      type: 'unique',
      name: 'unique_constraint_telegram_accounts',
    });
  },
  down: (queryInterface) => queryInterface.dropTable('TelegramAccounts'),
};
