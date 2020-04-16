module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Sections', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      sectionNumber: {
        type: Sequelize.STRING(8),
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
    });
    await queryInterface.addConstraint('Sections', ['sectionNumber', 'courseId', 'semesterId'], {
      type: 'unique',
      name: 'unique_constraint_sections',
    });
  },
  down: (queryInterface) => queryInterface.dropTable('Sections'),
};
