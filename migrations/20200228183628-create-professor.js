module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Professors', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    uid: {
      type: Sequelize.STRING(32),
      unique: true,
    },
    rfid: {
      type: Sequelize.STRING(32),
      unique: true,
    },
    name: {
      type: Sequelize.STRING,
    },
    image: {
      type: Sequelize.STRING,
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
  down: (queryInterface) => queryInterface.dropTable('Professors'),
};
