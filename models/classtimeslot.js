module.exports = (sequelize, DataTypes) => {
  const ClassTimeSlot = sequelize.define('ClassTimeSlot', {
    timeSlotId: DataTypes.INTEGER,
    classId: DataTypes.INTEGER,
  }, { timestamps: false });
  ClassTimeSlot.associate = () => {};
  return ClassTimeSlot;
};
