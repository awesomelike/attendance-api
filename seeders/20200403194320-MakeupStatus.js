module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert('MakeupStatuses', [
    {
      id: 1,
      name: 'Not seen',
    },
    {
      id: 2,
      name: 'Accepted',
    },
    {
      id: 3,
      name: 'Rejected',
    },
  ]),

  down: (queryInterface) => queryInterface.bulkDelete('MakeupStatuses', null, {}),
};
