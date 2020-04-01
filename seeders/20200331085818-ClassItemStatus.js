module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert('ClassItemStatuses', [
    {
      id: 1,
      name: 'Going on',
    },
    {
      id: 2,
      name: 'Finished',
    },
  ]),

  down: (queryInterface) => queryInterface.bulkDelete('ClassItemStatuses', null, {}),
};
