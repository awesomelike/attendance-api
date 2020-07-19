module.exports = (sequelize, DataTypes) => {
  const Record = sequelize.define('Record', {
    classItemId: DataTypes.INTEGER,
    studentId: DataTypes.INTEGER,
    isAttended: DataTypes.INTEGER,
    attendedAt: DataTypes.DATE,
    rfid: DataTypes.STRING,
    isAdditional: DataTypes.BOOLEAN,
  }, {});
  Record.associate = (models) => {
    Record.belongsTo(models.Student, { as: 'student', foreignKey: 'studentId' });
    Record.belongsTo(models.ClassItem, { as: 'classItem', foreignKey: 'classItemId' });
  };
  return Record;
};
