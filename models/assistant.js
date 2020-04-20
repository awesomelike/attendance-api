module.exports = (sequelize, DataTypes) => {
  const Assistant = sequelize.define('Assistant', {
    name: DataTypes.STRING,
    professorId: DataTypes.INTEGER,
  }, {});
  Assistant.associate = (models) => {
    Assistant.belongsTo(models.Professor, { as: 'professor', foreignKey: 'professorId' });
  };
  return Assistant;
};
