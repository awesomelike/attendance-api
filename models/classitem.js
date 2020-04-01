
module.exports = (sequelize, DataTypes) => {
  const ClassItem = sequelize.define('ClassItem', {
    classId: DataTypes.INTEGER,
    week: DataTypes.INTEGER,
    date: DataTypes.DATE,
    classItemStatusId: DataTypes.INTEGER,
  }, {});
  ClassItem.associate = (models) => {
    ClassItem.belongsTo(models.Class, { as: 'class', foreignKey: 'classId' });
    ClassItem.belongsTo(models.ClassItemStatus, { as: 'status', foreignKey: 'classItemStatusId' });
    ClassItem.hasMany(models.Record, { as: 'records', foreignKey: 'classItemId' });
  };
  return ClassItem;
};
