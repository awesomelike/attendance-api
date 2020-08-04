module.exports = (sequelize, DataTypes) => {
  const ClassItem = sequelize.define('ClassItem', {
    classId: DataTypes.INTEGER,
    week: DataTypes.INTEGER,
    plannedDate: DataTypes.DATE,
    date: DataTypes.DATE,
    // actualRoomId: DataTypes.INTEGER,
    classItemStatusId: DataTypes.INTEGER,
    semesterId: DataTypes.INTEGER,
  }, {});
  ClassItem.associate = (models) => {
    ClassItem.belongsTo(models.Class, { as: 'class', foreignKey: 'classId' });
    ClassItem.belongsTo(models.ClassItemStatus, { as: 'status', foreignKey: 'classItemStatusId' });
    ClassItem.hasMany(models.Record, { as: 'records', foreignKey: 'classItemId' });
    ClassItem.hasOne(models.Makeup, { as: 'makeup', foreignKey: 'classItemId' });
    ClassItem.belongsTo(models.Semester, { as: 'semester', foreignKey: 'semesterId' });
  };
  return ClassItem;
};
