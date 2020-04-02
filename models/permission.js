module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define('Permission', {
    name: DataTypes.STRING,
  }, {});
  Permission.associate = (models) => {
    Permission.belongsToMany(models.Role, {
      as: 'roles',
      through: models.RolePermission,
      foreignKey: 'permissionId',
    });
  };
  return Permission;
};
