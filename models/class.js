
module.exports = (sequelize, DataTypes) => {
  const Class = sequelize.define('Class', {
    sectionId: DataTypes.INTEGER,
    weekDayId: DataTypes.INTEGER,
    room: DataTypes.STRING,
  }, {});
  Class.associate = (models) => {
    Class.belongsTo(models.Section, { as: 'section', foreignKey: 'sectionId' });
    Class.belongsTo(models.WeekDay, { as: 'weekDay', foreignKey: 'weekDayId' });
    Class.hasMany(models.ClassItem, { as: 'classItems' });
    Class.belongsToMany(models.TimeSlot, {
      as: 'timeSlots',
      through: models.ClassTimeSlot,
      foreignKey: 'classId',
    });
  };
  return Class;
};
