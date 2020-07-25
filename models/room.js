module.exports = (sequelize, DataTypes) => {
  const Room = sequelize.define('Room', {
    label: DataTypes.STRING,
  }, {});
  Room.associate = (models) => {
    Room.hasMany(models.Class, { as: 'classes', foreignKey: 'roomId' });
    Room.hasMany(models.Makeup, { as: 'makeups', foreignKey: 'roomId' });
  };
  return Room;
};
