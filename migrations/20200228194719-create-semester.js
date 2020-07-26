module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Semesters', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      year: {
        type: Sequelize.INTEGER,
      },
      season: {
        type: Sequelize.STRING(32),
      },
      startDate: {
        type: Sequelize.DATEONLY,
      },
      endDate: {
        type: Sequelize.DATEONLY,
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
    await queryInterface.addConstraint('Semesters', ['year', 'season'], {
      type: 'unique',
      name: 'unique_constraint_semesters',
    });
  },
  down: (queryInterface) => queryInterface.dropTable('Semesters'),
};
