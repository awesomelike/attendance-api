
module.exports = (sequelize, DataTypes) => {
  const Semester = sequelize.define('Semester', {
    year: DataTypes.INTEGER,
    season: DataTypes.STRING,
  }, {});
  Semester.associate = (models) => {
    Semester.hasMany(models.Section, { as: 'sections' });
  };
  return Semester;
};
