const { NOT_SEEN, ACCEPTED, REJECTED } = require('../constants/makeups');

module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert('MakeupStatuses', [
    {
      id: NOT_SEEN,
      name: 'Not seen',
    },
    {
      id: ACCEPTED,
      name: 'Accepted',
    },
    {
      id: REJECTED,
      name: 'Rejected',
    },
  ]),

  down: (queryInterface) => queryInterface.bulkDelete('MakeupStatuses', null, {}),
};
