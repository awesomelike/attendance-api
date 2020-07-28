module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ClassItems', {
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
      plannedDate: {
        type: Sequelize.DATE,
      },
      date: {
        type: Sequelize.DATE,
      },
      classItemStatusId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'ClassItemStatuses',
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
    await queryInterface.addConstraint('ClassItems', ['classId', 'week', 'semesterId'], {
      type: 'unique',
      name: 'unique_constraint_class_items',
    });
  },
  down: (queryInterface) => queryInterface.dropTable('ClassItems'),
};
