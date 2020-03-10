module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('ClassTimeSlots', {
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
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  }),
  down: (queryInterface) => queryInterface.dropTable('ClassTimeSlots'),
};
