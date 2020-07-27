module.exports = (sequelize, DataTypes) => {
  const Record = sequelize.define('Record', {
    classItemId: DataTypes.INTEGER,
    studentId: DataTypes.INTEGER,
    isAttended: DataTypes.INTEGER,
    attendedAt: DataTypes.DATE,
    rfid: DataTypes.STRING,
    isAdditional: DataTypes.BOOLEAN,
    semesterId: DataTypes.INTEGER,
  }, {});
  Record.associate = (models) => {
    Record.belongsTo(models.Student, { as: 'student', foreignKey: 'studentId' });
    Record.belongsTo(models.ClassItem, { as: 'classItem', foreignKey: 'classItemId' });
    Record.belongsTo(models.Semester, { as: 'semester', foreignKey: 'semesterId' });
  };
  return Record;
};
