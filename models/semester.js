module.exports = (sequelize, DataTypes) => {
  const Semester = sequelize.define('Semester', {
    year: DataTypes.INTEGER,
    season: DataTypes.STRING,
    startDate: DataTypes.DATEONLY,
    endDate: DataTypes.DATEONLY,
  }, {});
  Semester.associate = (models) => {
    Semester.hasMany(models.Section, { as: 'sections', foreignKey: 'semesterId' });
  };
  return Semester;
};
