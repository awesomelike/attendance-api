
module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert('TimeSlots', [
    {
      id: 1,
      startTime: '09:00',
    }, {
      id: 2,
      startTime: '10:30',
    }, {
      id: 3,
      startTime: '12:00',
    }, {
      id: 4,
      startTime: '13:30',
    }, {
      id: 5,
      startTime: '15:00',
    }, {
      id: 6,
      startTime: '16:30',
    }, {
      id: 7,
      startTime: '18:00',
    },
  ]),
  down: (queryInterface) => queryInterface.bulkDelete('TimeSlots', null, {}),
};
