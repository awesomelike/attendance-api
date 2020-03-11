
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('ClassItems', {
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
    },
    week: {
      type: Sequelize.INTEGER,
    },
    date: {
      type: Sequelize.DATE,
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
  down: (queryInterface) => queryInterface.dropTable('ClassItems'),
};
