
module.exports = (sequelize, DataTypes) => {
  const WeekDay = sequelize.define('WeekDay', {
    key: DataTypes.STRING,
    name: DataTypes.STRING,
  }, {});
  WeekDay.associate = (models) => {
    WeekDay.hasMany(models.Class, { as: 'classes' });
  };
  return WeekDay;
};
