module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert('ClassItemStatuses', [
    {
      id: 1,
      name: 'Planned',
    },
    {
      id: 2,
      name: 'Going on',
    },
    {
      id: 3,
      name: 'Finished',
    },
  ]),

  down: (queryInterface) => queryInterface.bulkDelete('ClassItemStatuses', null, {}),
};
