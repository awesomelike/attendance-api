
module.exports = (sequelize, DataTypes) => {
  const Class = sequelize.define('Class', {
    sectionId: DataTypes.INTEGER,
    weekDay: DataTypes.STRING,
    week: DataTypes.INTEGER,
    date: DataTypes.DATE,
  }, {});
  Class.associate = (models) => {
    Class.belongsTo(models.Section, { as: 'section', foreignKey: 'sectionId' });
    Class.hasMany(models.Record, { as: 'records' });
    Class.belongsToMany(models.TimeSlot, {
      as: 'timeSlots',
      through: models.ClassTimeSlot,
      foreignKey: 'classId',
    });
  };
  return Class;
};
