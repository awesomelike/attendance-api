
module.exports = (sequelize, DataTypes) => {
  const Class = sequelize.define('Class', {
    sectionId: DataTypes.INTEGER,
    week: DataTypes.INTEGER,
    date: DataTypes.DATE,
    timeSlotId: DataTypes.INTEGER,
  }, {});
  Class.associate = (models) => {
    Class.belongsTo(models.TimeSlot, { as: 'timeslot', foreignKey: 'timeSlotId' });
    Class.belongsTo(models.Section, { as: 'section', foreignKey: 'sectionId' });
    Class.hasMany(models.Record, { as: 'records' });
  };
  return Class;
};
