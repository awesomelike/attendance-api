module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ClassTimeSlots', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      timeSlotId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'TimeSlots',
          key: 'id',
        },
      },
      classId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Classes',
          key: 'id',
        },
      },
    });
    await queryInterface.addConstraint('ClassTimeSlots', ['timeSlotId', 'classId'], {
      type: 'unique',
      name: 'unique_constraint_class_time_slots',
    });
  },
  down: (queryInterface) => queryInterface.dropTable('ClassTimeSlots'),
};
