module.exports = (sequelize, DataTypes) => {
  const ClassTimeSlot = sequelize.define('ClassTimeSlot', {
    timeSlotId: DataTypes.INTEGER,
    classId: DataTypes.INTEGER,
  }, {});
  ClassTimeSlot.associate = () => {
    // associations can be defined here
  };
  return ClassTimeSlot;
};
