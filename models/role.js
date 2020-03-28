module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    name: DataTypes.STRING,
  }, {});
  Role.associate = (models) => {
    Role.hasMany(models.Account, { as: 'accounts', foreignKey: 'roleId' });
  };
  return Role;
};
