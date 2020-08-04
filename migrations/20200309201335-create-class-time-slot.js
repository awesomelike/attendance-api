module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ClassTimeSlots', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      classId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Classes',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      timeSlotId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'TimeSlots',
          key: 'id',
        },
      },
      semesterId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Semesters',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
    });
    await queryInterface.addConstraint('ClassTimeSlots', ['timeSlotId', 'classId'], {
      type: 'unique',
      name: 'unique_constraint_class_time_slots',
    });
  },
  down: (queryInterface) => queryInterface.dropTable('ClassTimeSlots'),
};
