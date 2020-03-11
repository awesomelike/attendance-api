
module.exports = (sequelize, DataTypes) => {
  const Class = sequelize.define('Class', {
    sectionId: DataTypes.INTEGER,
    weekDay: DataTypes.STRING,
    room: DataTypes.STRING,
  }, {});
  Class.associate = (models) => {
    Class.belongsTo(models.Section, { as: 'section', foreignKey: 'sectionId' });
    Class.hasMany(models.ClassItem, { as: 'classItems' });
    Class.belongsToMany(models.TimeSlot, {
      as: 'timeSlots',
      through: models.ClassTimeSlot,
      foreignKey: 'classId',
    });
  };
  return Class;
};
