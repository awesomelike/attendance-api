module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('StudentSections', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      studentId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Students',
          key: 'id',
        },
      },
      sectionId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Sections',
          key: 'id',
        },
      },
    });
    await queryInterface.addConstraint('StudentSections', ['studentId', 'sectionId'], {
      type: 'unique',
      name: 'unique_constraint_student_sections',
    });
  },
  down: (queryInterface) => queryInterface.dropTable('StudentSections'),
};
