module.exports = (sequelize, DataTypes) => {
  const Assistant = sequelize.define('Assistant', {
    professorId: DataTypes.INTEGER,
    accountId: DataTypes.INTEGER,
  }, {});
  Assistant.associate = (models) => {
    Assistant.belongsTo(models.Professor, { as: 'professor', foreignKey: 'professorId' });
    Assistant.belongsTo(models.Assistant, { as: 'account', foreignKey: 'accountId' });
  };
  return Assistant;
};
