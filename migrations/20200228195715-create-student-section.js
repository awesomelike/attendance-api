
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('StudentSections', {
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
    studentId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'Students',
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
  down: (queryInterface) => queryInterface.dropTable('StudentSections'),
};
