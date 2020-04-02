module.exports = (sequelize, DataTypes) => {
  const Class = sequelize.define('Class', {
    weekDayId: DataTypes.INTEGER,
    roomId: DataTypes.INTEGER,
  }, {});
  Class.associate = (models) => {
    Class.belongsTo(models.Section, { as: 'section', foreignKey: 'sectionId' });
    Class.belongsTo(models.WeekDay, { as: 'weekDay', foreignKey: 'weekDayId' });
    Class.belongsTo(models.Room, { as: 'room', foreignKey: 'roomId' });
    Class.hasMany(models.ClassItem, { as: 'classItems', foreignKey: 'classId' });
    Class.belongsToMany(models.TimeSlot, {
      as: 'timeSlots',
      through: models.ClassTimeSlot,
      foreignKey: 'classId',
    });
  };
  return Class;
};
