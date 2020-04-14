const data = require('../data/seed/roles');

const roles = Object.entries(data).map((element) => element[1]);

module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert('Roles', roles),
  down: (queryInterface) => queryInterface.bulkDelete('Roles', null, {}),
};
