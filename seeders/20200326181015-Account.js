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
    {
      id: 4,
      username: 'U15142',
      password: hashSync('123456', genSaltSync()),
      name: 'Bobir Muratov',
      email: 'b.muratov@inha.uz',
      roleId: 1,
      accountStatus: 1,
    },
    {
      id: 5,
      username: 'U18015',
      password: hashSync('123456', genSaltSync()),
      name: 'Diyora Aliyeva',
      email: 'd.aliyeva@inha.uz',
      roleId: 1,
      accountStatus: 1,
    },
    {
      id: 6,
      name: 'Gulmira Khodieva',
      username: 'U14121',
      email: 'g.khodieva@inha.uz',
      password: hashSync('123456', genSaltSync()),
      roleId: 1,
      accountStatus: 1,
    },
    {
      id: 7,
      name: 'Lee Dong Won',
      username: 'U19016',
      email: 'l.dongwon@inha.uz',
      password: hashSync('123456', genSaltSync()),
      roleId: 1,
      accountStatus: 1,
    },
    {
      id: 8,
      name: 'Muslimakhon Madjidova',
      username: 'U18008',
      email: 'm.madjidova@inha.uz',
      password: hashSync('123456', genSaltSync()),
      roleId: 1,
      accountStatus: 1,
    },
    {
      id: 9,
      name: 'Sardor Abduvoxidov',
      username: 'U18017',
      email: 's.abduvoxidov@inha.uz',
      password: hashSync('123456', genSaltSync()),
      roleId: 1,
      accountStatus: 1,
    },
    {
      id: 10,
      name: 'Umida Rustamova',
      username: 'U17008',
      email: 'u.rustamova@inha.uz',
      password: hashSync('123456', genSaltSync()),
      roleId: 1,
      accountStatus: 1,
    },
    {
      id: 11,
      name: 'Youngjae Won',
      username: 'U19020',
      email: 'y.won@inha.uz',
      password: hashSync('123456', genSaltSync()),
      roleId: 1,
      accountStatus: 1,
    },
  ]),

  down: (queryInterface) => queryInterface.bulkDelete('Accounts', null, {}),
};
