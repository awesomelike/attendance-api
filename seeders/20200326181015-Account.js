const { hashSync, genSaltSync } = require('bcryptjs');

module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert('Accounts', [
    {
      id: 1,
      username: 'affairs',
      password: hashSync('affairs', genSaltSync()),
      name: 'Ulugbek Muratov',
      email: 'u.muratov@inha.uz',
      roleId: 1,
      accountStatus: 1,
    },
    {
      id: 2,
      username: 'professor',
      password: hashSync('professor', genSaltSync()),
      name: 'Chongkoo An',
      email: 'familyhomeuz@gmail.com',
      roleId: 2,
      accountStatus: 1,
    },
    {
      id: 3,
      username: 'admin',
      password: hashSync('admin', genSaltSync()),
      name: 'Admin',
      email: 'iutattendancesystem@gmail.com',
      roleId: 3,
      accountStatus: 1,
    },
  ]),

  down: (queryInterface) => queryInterface.bulkDelete('Accounts', null, {}),
};
