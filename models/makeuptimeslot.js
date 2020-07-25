module.exports = (sequelize, DataTypes) => {
  const MakeupTimeSlot = sequelize.define('MakeupTimeSlot', {
    makeupId: DataTypes.INTEGER,
    timeSlotId: DataTypes.INTEGER,
  }, { timestamps: false });
  MakeupTimeSlot.associate = () => {};
  return MakeupTimeSlot;
};
