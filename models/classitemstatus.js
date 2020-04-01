
module.exports = (sequelize, DataTypes) => {
  const ClassItemStatus = sequelize.define('ClassItemStatus', {
    name: DataTypes.STRING,
  }, {});
  ClassItemStatus.associate = (models) => {
    ClassItemStatus.hasMany(models.ClassItem, { as: 'classItems', foreignKey: 'classItemStatusId' });
  };
  return ClassItemStatus;
};
