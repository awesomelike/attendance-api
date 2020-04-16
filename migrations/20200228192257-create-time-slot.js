module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('TimeSlots', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    startTime: {
      type: Sequelize.STRING,
    },
    endTime: {
      type: Sequelize.STRING,
    },
  }),
  down: (queryInterface) => queryInterface.dropTable('TimeSlots'),
};
