module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Classes', {
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
      roomId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Rooms',
          key: 'id',
        },
      },
      weekDayId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'WeekDays',
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
      index: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
    // await queryInterface.addConstraint('Classes', ['sectionId', 'roomId', 'weekDayId', 'semesterId'], {
    //   type: 'unique',
    //   name: 'unique_constraint_classes',
    // });
    await queryInterface.addConstraint('Classes', ['index', 'semesterId'], {
      type: 'unique',
      name: 'unique_constraint_classes',
    });
  },
  down: (queryInterface) => queryInterface.dropTable('Classes'),
};
