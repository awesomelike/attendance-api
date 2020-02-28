
module.exports = (sequelize, DataTypes) => {
  const StudentSection = sequelize.define('StudentSection', {
    sectionId: DataTypes.INTEGER,
    studentId: DataTypes.INTEGER,
  }, {});
  StudentSection.associate = () => {
    // associations can be defined here
  };
  return StudentSection;
};
