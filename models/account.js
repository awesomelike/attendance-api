module.exports = (sequelize, DataTypes) => {
  const Account = sequelize.define('Account', {
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    roleId: DataTypes.INTEGER,
    accountStatus: DataTypes.INTEGER,
  }, {});
  Account.associate = (models) => {
    Account.belongsTo(models.Role, { as: 'role', foreignKey: 'roleId' });
    Account.hasOne(models.Professor, { as: 'professor', foreignKey: 'accountId' });
  };
  return Account;
};
