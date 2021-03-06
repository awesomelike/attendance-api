module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    name: DataTypes.STRING,
    courseNumber: DataTypes.STRING,
  }, {});
  Course.associate = (models) => {
    Course.hasMany(models.Section, { as: 'sections', foreignKey: 'courseId' });
  };
  return Course;
};
