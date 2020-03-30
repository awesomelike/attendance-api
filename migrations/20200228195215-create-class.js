
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
    roomId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'Rooms',
        key: 'id',
      },
    },
    weekDayId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'WeekDays',
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
  down: (queryInterface) => queryInterface.dropTable('Classes'),
};
