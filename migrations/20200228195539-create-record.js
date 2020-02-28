
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Records', {
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
    studentId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'Students',
        key: 'id',
      },
    },
    isAdditional: {
      type: Sequelize.INTEGER,
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
  down: (queryInterface) => queryInterface.dropTable('Records'),
};
