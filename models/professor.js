module.exports = (sequelize, DataTypes) => {
  const Professor = sequelize.define('Professor', {
    uid: DataTypes.STRING,
    rfid: DataTypes.STRING,
    name: DataTypes.STRING,
    image: DataTypes.STRING,
    accountId: DataTypes.INTEGER,
  }, {});
  Professor.associate = (models) => {
    Professor.hasMany(models.Section, { as: 'sections', foreignKey: 'professorId' });
    Professor.hasMany(models.Assistant, { as: 'assistants', foreignKey: 'professorId' });
    Professor.belongsTo(models.Account, { as: 'account', foreignKey: 'accountId' });
  };
  return Professor;
};
