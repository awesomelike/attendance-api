
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('StudentSections', {
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
  down: (queryInterface) => queryInterface.dropTable('StudentSections'),
};
