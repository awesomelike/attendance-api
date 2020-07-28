module.exports = (sequelize, DataTypes) => {
  const Makeup = sequelize.define('Makeup', {
    classItemId: DataTypes.INTEGER,
    professorId: DataTypes.INTEGER,
    newDate: DataTypes.DATE,
    roomId: DataTypes.INTEGER,
    makeupStatusId: DataTypes.INTEGER,
    resolvedById: DataTypes.INTEGER,
    resolvedAt: DataTypes.DATE,
    semesterId: DataTypes.INTEGER,
  }, {});
  Makeup.associate = (models) => {
    Makeup.belongsTo(models.ClassItem, { as: 'classItem', foreignKey: 'classItemId' });
    Makeup.belongsTo(models.Professor, { as: 'professor', foreignKey: 'professorId' });
    Makeup.belongsTo(models.Room, { as: 'room', foreignKey: 'roomId' });
    Makeup.belongsTo(models.MakeupStatus, { as: 'makeupStatus', foreignKey: 'makeupStatusId' });
    Makeup.belongsTo(models.Account, { as: 'resolvedBy', foreignKey: 'resolvedById' });
    Makeup.belongsToMany(models.TimeSlot, {
      as: 'timeSlots',
      through: models.MakeupTimeSlot,
      foreignKey: 'makeupId',
    });
    Makeup.belongsTo(models.Semester, { as: 'semester', foreignKey: 'semesterId' });
  };
  return Makeup;
};
