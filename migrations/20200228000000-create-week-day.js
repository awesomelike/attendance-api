
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('WeekDays', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    key: {
      type: Sequelize.STRING,
    },
    name: {
      type: Sequelize.STRING,
    },
    // createdAt: {
    //   allowNull: false,
    //   type: Sequelize.DATE,
    //   defaultValue: Sequelize.fn('now'),
    // },
    // updatedAt: {
    //   allowNull: false,
    //   type: Sequelize.DATE,
    //   defaultValue: Sequelize.fn('now'),
    // },
  }),
  down: (queryInterface) => queryInterface.dropTable('WeekDays'),
};
