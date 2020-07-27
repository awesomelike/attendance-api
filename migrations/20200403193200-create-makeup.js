module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Makeups', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    classItemId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'ClassItems',
        key: 'id',
      },
    },
    professorId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'Professors',
        key: 'id',
      },
    },
    newDate: {
      type: Sequelize.DATE,
    },
    roomId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'Rooms',
        key: 'id',
      },
    },
    makeupStatusId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'MakeupStatuses',
        key: 'id',
      },
      defaultValue: 1,
    },
    resolvedById: {
      type: Sequelize.INTEGER,
      references: {
        model: 'Accounts',
        key: 'id',
      },
    },
    resolvedAt: {
      type: Sequelize.DATE,
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
    },
  }),
  down: (queryInterface) => queryInterface.dropTable('Makeups'),
};
