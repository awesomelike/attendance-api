module.exports = (sequelize, DataTypes) => {
  const ClassTimeSlot = sequelize.define('ClassTimeSlot', {
    classId: DataTypes.INTEGER,
    timeSlotId: DataTypes.INTEGER,
    semesterId: DataTypes.INTEGER,
  }, { timestamps: false });
  ClassTimeSlot.associate = () => {};
  return ClassTimeSlot;
};
