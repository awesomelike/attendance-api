const data = require('../data/seed/permissions');

const permissions = [];
Object.entries(data).forEach((entry) => permissions.push(entry[1]));

module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert('Permissions', permissions),
  down: (queryInterface) => queryInterface.bulkDelete('Permissions', null, {}),
};
