module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('MakeupTimeSlots', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    makeupId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'Makeups',
        key: 'id',
      },
    },
    timeSlotId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'TimeSlots',
        key: 'id',
      },
    },
  }),
  down: (queryInterface) => queryInterface.dropTable('MakeupTimeSlots'),
};
