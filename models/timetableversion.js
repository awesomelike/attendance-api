module.exports = (sequelize, DataTypes) => {
  const TimetableVersion = sequelize.define('TimetableVersion', {
    semesterId: DataTypes.INTEGER,
    version: DataTypes.INTEGER,
    fileStudents: DataTypes.STRING,
    fileTimetable: DataTypes.STRING,
    addedById: DataTypes.INTEGER,
  }, { timestamps: false });
  TimetableVersion.associate = (models) => {
    TimetableVersion.belongsTo(models.Semester, { as: 'semester', foreignKey: 'semesterId' });
    TimetableVersion.belongsTo(models.Account, { as: 'addedBy', foreignKey: 'addedById' });
  };
  return TimetableVersion;
};
