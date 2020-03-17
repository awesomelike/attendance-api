
module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert('Records', [], {}),
  down: (queryInterface) => queryInterface.bulkDelete('Records', null, {}),
};
