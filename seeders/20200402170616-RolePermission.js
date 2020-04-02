module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert('RolePermissions', [
    {
      roleId: 1,
      permissionId: 1,
    },
    {
      roleId: 1,
      permissionId: 2,
    },
    {
      roleId: 1,
      permissionId: 3,
    },
    {
      roleId: 1,
      permissionId: 4,
    },
    {
      roleId: 1,
      permissionId: 5,
    },
    {
      roleId: 1,
      permissionId: 6,
    },
    {
      roleId: 2,
      permissionId: 7,
    },
    {
      roleId: 3,
      permissionId: 1,
    },
    {
      roleId: 3,
      permissionId: 2,
    },
    {
      roleId: 3,
      permissionId: 3,
    },
    {
      roleId: 3,
      permissionId: 4,
    },
    {
      roleId: 3,
      permissionId: 5,
    },
    {
      roleId: 3,
      permissionId: 6,
    },
    {
      roleId: 3,
      permissionId: 7,
    },
  ]),

  down: (queryInterface) => queryInterface.bulkDelete('RolePermissions', null, {}),
};
