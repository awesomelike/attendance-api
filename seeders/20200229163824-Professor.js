require('dotenv').config();
const { hashSync } = require('bcryptjs');

module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert('Professors', [
    {
      id: 1,
      rfid: '607a435f',
      name: 'Davlatov Zafar',
      uid: 'U171040',
      image: `${process.env.BASE_URL}/assets/staff.png`,
      password: hashSync('zafar', 10),
    },
  ]),
  down: (queryInterface) => queryInterface.bulkDelete('Professors', null, {}),
};
