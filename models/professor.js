
module.exports = (sequelize, DataTypes) => {
  const Professor = sequelize.define('Professor', {
    uid: DataTypes.STRING,
    rfid: DataTypes.STRING,
    name: DataTypes.STRING,
    image: DataTypes.STRING,
  }, {});
  Professor.associate = (models) => {
    Professor.hasMany(models.Section, { as: 'sections' });
  };
  return Professor;
};
