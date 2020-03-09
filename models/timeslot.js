
module.exports = (sequelize, DataTypes) => {
  const TimeSlot = sequelize.define('TimeSlot', {
    startTime: DataTypes.STRING,
    endTime: DataTypes.STRING,
  }, {});
  TimeSlot.associate = (models) => {
    TimeSlot.belongsToMany(models.Class, {
      as: 'classes',
      through: models.ClassTimeSlot,
      foreignKey: 'timeSlotId',
    });
  };
  return TimeSlot;
};
