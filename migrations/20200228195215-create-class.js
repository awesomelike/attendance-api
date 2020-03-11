
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
    room: {
      type: Sequelize.STRING,
    },
    week: {
      type: Sequelize.INTEGER,
    },
    weekDay: {
      type: Sequelize.STRING,
    },
    date: {
      type: Sequelize.DATE,
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
