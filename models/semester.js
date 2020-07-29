module.exports = (sequelize, DataTypes) => {
  const Semester = sequelize.define('Semester', {
    year: DataTypes.INTEGER,
    season: DataTypes.STRING,
    startDate: DataTypes.DATEONLY,
    endDate: DataTypes.DATEONLY,
  }, {});
  Semester.associate = (models) => {
    Semester.hasMany(models.Section, { as: 'sections', foreignKey: 'semesterId' });
    Semester.hasMany(models.Class, { as: 'classes', foreignKey: 'semesterId' });
    Semester.hasMany(models.ClassItem, { as: 'classItems', foreignKey: 'semesterId' });
    Semester.hasMany(models.Makeup, { as: 'makeups', foreignKey: 'semesterId' });
    Semester.hasMany(models.Record, { as: 'records', foreignKey: 'semesterId' });
    Semester.hasMany(models.TimetableVersion, { as: 'versions', foreignKey: 'semesterId' });
  };
  return Semester;
};
