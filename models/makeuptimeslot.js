module.exports = (sequelize, DataTypes) => {
  const MakeupTimeSlot = sequelize.define('MakeupTimeSlot', {
    makeupId: DataTypes.INTEGER,
    timeSlotId: DataTypes.INTEGER,
  }, {});
  MakeupTimeSlot.associate = (models) => {
    // associations can be defined here
  };
  return MakeupTimeSlot;
};
