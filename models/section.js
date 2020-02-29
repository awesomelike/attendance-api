
module.exports = (sequelize, DataTypes) => {
  const Section = sequelize.define('Section', {
    sectionNumber: DataTypes.INTEGER,
    professorId: DataTypes.INTEGER,
    courseId: DataTypes.INTEGER,
    semesterId: DataTypes.INTEGER,
  }, {});
  Section.associate = (models) => {
    Section.belongsTo(models.Course, { as: 'course', foreignKey: 'courseId' });
    Section.belongsTo(models.Professor, { as: 'professor', foreignKey: 'professorId' });
    Section.belongsTo(models.Semester, { as: 'semester', foreignKey: 'semesterId' });
    Section.hasMany(models.Class, { as: 'classes' });
    Section.belongsToMany(models.Student, {
      as: 'students',
      through: models.StudentSection,
      foreignKey: 'sectionId',
    });
  };
  return Section;
};
