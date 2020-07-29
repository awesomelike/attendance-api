module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('TimetableVersions', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    semesterId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'Semesters',
        key: 'id',
      },
    },
    fileStudents: {
      type: Sequelize.STRING,
    },
    fileTimetable: {
      type: Sequelize.STRING,
    },
    version: {
      type: Sequelize.INTEGER,
      defaultValue: 1,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.fn('now'),
    },
  }),
  down: (queryInterface) => queryInterface.dropTable('TimetableVersions'),
};
