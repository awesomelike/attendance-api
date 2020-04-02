module.exports = (sequelize, DataTypes) => {
  const RolePermission = sequelize.define('RolePermission', {
    roleId: DataTypes.INTEGER,
    permissionId: DataTypes.INTEGER,
  }, {});
  RolePermission.associate = () => {

  };
  return RolePermission;
};
