
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Classes', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    sectionId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'Sections',
        key: 'id',
      },
    },
    week: {
      type: Sequelize.INTEGER,
    },
    date: {
      type: Sequelize.DATE,
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
  down: (queryInterface) => queryInterface.dropTable('Classes'),
};
