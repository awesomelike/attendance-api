require('dotenv').config();
const { hashSync } = require('bcryptjs');

module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert('Students', [
    {
      id: 1,
      rfid: 'c001bc5c',
      name: 'Inadullaev Makhmudjon',
      uid: 'U1710047',
      image: `${process.env.BASE_URL}/assets/makhmudjon.jpg`,
      password: hashSync('mahmud', 10),
    },
    {
      id: 2,
      rfid: '24120de0',
      name: 'Abdullaev Azamat',
      uid: 'U1710008',
      image: `${process.env.BASE_URL}/assets/azamat.jpg`,
      password: hashSync('azamat', 10),
    },
    {
      id: 3,
      rfid: '17525e05',
      name: 'Makhmudkhujaev Saidakbar',
      uid: 'U1710073',
      image: `${process.env.BASE_URL}/assets/saidakbar.jpg`,
      password: hashSync('saidakbar', 10),
    },
  ]),
  down: (queryInterface) => queryInterface.bulkDelete('Students', null, {}),
};
