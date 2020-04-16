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
  }),
  down: (queryInterface) => queryInterface.dropTable('WeekDays'),
};
