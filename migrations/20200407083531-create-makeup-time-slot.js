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
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  }),
  down: (queryInterface) => queryInterface.dropTable('MakeupTimeSlots'),
};
