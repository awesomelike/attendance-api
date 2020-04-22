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
      defaultValue: Sequelize.fn('now'),
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.fn('now'),
    },
  }),
  down: (queryInterface) => queryInterface.dropTable('MakeupTimeSlots'),
};
