
module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define('Student', {
    uid: DataTypes.STRING,
    rfid: DataTypes.STRING,
    name: DataTypes.STRING,
    image: DataTypes.STRING,
    schoolYear: DataTypes.STRING,
    department: DataTypes.STRING,
  }, {});
  Student.associate = (models) => {
    Student.hasMany(models.Record, { as: 'records', foreignKey: 'studentId' });
    Student.belongsToMany(models.Section, {
      as: 'sections',
      through: models.StudentSection,
      foreignKey: 'studentId',
    });
  };
  return Student;
};
