module.exports = (sequelize, DataTypes) => {
  const MakeupStatus = sequelize.define('MakeupStatus', {
    name: DataTypes.STRING,
  }, {});
  MakeupStatus.associate = (models) => {
    MakeupStatus.hasMany(models.Makeup, { as: 'makeups', foreignKey: 'makeupStatusId' });
  };
  return MakeupStatus;
};
