module.exports = (sequelize, DataTypes) => {
  const Account = sequelize.define('Account', {
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    roleId: DataTypes.INTEGER,
  }, {});
  Account.associate = (models) => {
    Account.belongsTo(models.Role, { as: 'role', foreignKey: 'roleId' });
    Account.belongsTo(models.Professor, { as: 'professor', foreignKey: 'accountId' });
  };
  return Account;
};
