
module.exports = (sequelize, DataTypes) => {
  const ClassItem = sequelize.define('ClassItem', {
    classId: DataTypes.INTEGER,
    week: DataTypes.INTEGER,
    date: DataTypes.DATE,
  }, {});
  ClassItem.associate = (models) => {
    ClassItem.belongsTo(models.Class, { as: 'class', foreignKey: 'classId' });
    ClassItem.hasMany(models.Record, { as: 'records', foreignKey: 'classItemId' });
  };
  return ClassItem;
};
