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
    Account.hasMany(models.TimetableVersion, { as: 'timetableVersions', foreignKey: 'accountId' });
    Account.hasOne(models.Assistant, { as: 'assistant', foreignKey: 'accountId' });
  };
  return Account;
};
