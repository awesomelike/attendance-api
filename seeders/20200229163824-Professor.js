require('dotenv').config();

module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert('Professors', [
    {
      id: 1,
      rfid: '607a435f',
      name: 'Davlatov Zafar',
      uid: 'U171040',
      image: `${process.env.BASE_URL}/assets/staff.png`,
    },
  ]),
  down: (queryInterface) => queryInterface.bulkDelete('Professors', null, {}),
};
