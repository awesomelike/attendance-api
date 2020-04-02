module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    name: DataTypes.STRING,
  }, {});
  Role.associate = (models) => {
    Role.hasMany(models.Account, { as: 'accounts', foreignKey: 'roleId' });
    Role.belongsToMany(models.Permission, {
      as: 'permissions',
      through: models.RolePermission,
      foreignKey: 'roleId',
    });
  };
  return Role;
};
