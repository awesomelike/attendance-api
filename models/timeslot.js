
module.exports = (sequelize, DataTypes) => {
  const TimeSlot = sequelize.define('TimeSlot', {
    startTime: DataTypes.STRING,
  }, {});
  TimeSlot.associate = (models) => {
    TimeSlot.hasMany(models.Class, { as: 'classes' });
  };
  return TimeSlot;
};
