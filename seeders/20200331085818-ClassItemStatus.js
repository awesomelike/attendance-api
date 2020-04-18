const { PLANNED, GOING_ON, FINISHED } = require('../constants/classItems');

module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert('ClassItemStatuses', [
    {
      id: PLANNED,
      name: 'Planned',
    },
    {
      id: GOING_ON,
      name: 'Going on',
    },
    {
      id: FINISHED,
      name: 'Finished',
    },
  ]),

  down: (queryInterface) => queryInterface.bulkDelete('ClassItemStatuses', null, {}),
};
