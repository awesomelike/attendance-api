
module.exports = (sequelize, DataTypes) => {
  const Record = sequelize.define('Record', {
    classId: DataTypes.INTEGER,
    studentId: DataTypes.INTEGER,
    isAdditional: DataTypes.INTEGER,
  }, {});
  Record.associate = (models) => {
    Record.belongsTo(models.Student, { as: 'student', foreignKey: 'studentId' });
    Record.belongsTo(models.Class, { as: 'class', foreignKey: 'classId' });
  };
  return Record;
};
