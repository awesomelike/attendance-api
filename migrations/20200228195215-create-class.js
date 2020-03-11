
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
    weekDay: {
      type: Sequelize.STRING,
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
