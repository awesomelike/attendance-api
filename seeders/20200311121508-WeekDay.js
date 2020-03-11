
module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert('WeekDays', [
    {
      id: 1,
      key: 'Mon',
      name: 'Monday',
    },
    {
      id: 2,
      key: 'Tue',
      name: 'Tuesday',
    },
    {
      id: 3,
      key: 'Wed',
      name: 'Wednesday',
    },
    {
      id: 4,
      key: 'Thu',
      name: 'Thursday',
    },
    {
      id: 5,
      key: 'Fri',
      name: 'Friday',
    },
    {
      id: 6,
      key: 'Sat',
      name: 'Saturday',
    },
    {
      id: 7,
      key: 'Sun',
      name: 'Sunday',
    },
  ]),

  down: (queryInterface) => queryInterface.bulkDelete('Professors', null, {}),
};
