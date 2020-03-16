const timeSlots = require('../data/timeslots.json');

module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert('TimeSlots', timeSlots),
  down: (queryInterface) => queryInterface.bulkDelete('TimeSlots', null, {}),
};
