
module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert('Accounts', [
    {
      id: 1,
      username: 'affairs',
      password: 'affairs',
      name: 'Ulugbek Muratov',
      email: 'u.muratov@inha.uz',
      roleId: 1,
    },
    {
      id: 2,
      username: 'professor',
      password: 'professor',
      name: 'Chongkoo An',
      email: 'c.an@inha.uz',
      roleId: 2,
    },
  ]),

  down: (queryInterface) => queryInterface.bulkDelete('Accounts', null, {}),
};
