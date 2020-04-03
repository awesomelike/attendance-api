module.exports = (sequelize, DataTypes) => {
  const Makeup = sequelize.define('Makeup', {
    classItemId: DataTypes.INTEGER,
    newDate: DataTypes.DATE,
    roomId: DataTypes.INTEGER,
    makeupStatusId: DataTypes.INTEGER,
    resolvedById: DataTypes.INTEGER,
    resolvedAt: DataTypes.DATE,
  }, {});
  Makeup.associate = (models) => {
    Makeup.belongsTo(models.ClassItem, { as: 'classItem', foreignKey: 'classItemId' });
    Makeup.belongsTo(models.Room, { as: 'room', foreignKey: 'roomId' });
    Makeup.belongsTo(models.MakeupStatus, { as: 'makeupStatus', foreignKey: 'makeupStatusId' });
    Makeup.belongsTo(models.Account, { as: 'resolvedBy', foreignKey: 'resolvedById' });
  };
  return Makeup;
};
