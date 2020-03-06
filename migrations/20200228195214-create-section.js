
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Sections', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    sectionNumber: {
      type: Sequelize.STRING,
    },
    professorId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'Professors',
        key: 'id',
      },
    },
    courseId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'Courses',
        key: 'id',
      },
    },
    semesterId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'Semesters',
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
  down: (queryInterface) => queryInterface.dropTable('Sections'),
};
