
module.exports = (sequelize, DataTypes) => {
  const WeekDay = sequelize.define('WeekDay', {
    key: DataTypes.STRING,
    name: DataTypes.STRING,
  }, {
    timestamps: false,
  });
  WeekDay.associate = (models) => {
    WeekDay.hasMany(models.Class, { as: 'classes', foreignKey: 'weekDayId' });
  };
  return WeekDay;
};
