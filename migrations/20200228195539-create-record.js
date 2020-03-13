
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Records', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    classItemId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'ClassItems',
        key: 'id',
      },
    },
    studentId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'Students',
        key: 'id',
      },
    },
    isAttended: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    rfid: {
      type: Sequelize.STRING,
    },
    isAdditional: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
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
  down: (queryInterface) => queryInterface.dropTable('Records'),
};
