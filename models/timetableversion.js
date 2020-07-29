module.exports = (sequelize, DataTypes) => {
  const TimetableVersion = sequelize.define('TimetableVersion', {
    semesterId: DataTypes.INTEGER,
    fileStudents: DataTypes.STRING,
    fileTimetable: DataTypes.STRING,
    version: DataTypes.INTEGER,
  }, { timestamps: false });
  TimetableVersion.associate = (models) => {
    TimetableVersion.belongsTo(models.Semester, { as: 'semester', foreignKey: 'semesterId' });
  };
  return TimetableVersion;
};
