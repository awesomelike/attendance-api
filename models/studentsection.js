module.exports = (sequelize, DataTypes) => {
  const StudentSection = sequelize.define('StudentSection', {
    studentId: DataTypes.INTEGER,
    sectionId: DataTypes.INTEGER,
  }, { timestamps: false });
  StudentSection.associate = () => {};
  return StudentSection;
};
