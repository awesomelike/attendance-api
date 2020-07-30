module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert('Semesters', [
    {
      id: 1,
      year: 2019,
      season: 'Spring',
      startDate: new Date(2019, 0, 1),
      endDate: new Date(2019, 4, 17),
    }, {
      id: 2,
      year: 2019,
      season: 'Fall',
      startDate: new Date(2019, 8, 9),
      endDate: new Date(2020, 5, 31),
    }, {
      id: 3,
      year: 2020,
      season: 'Spring',
      startDate: new Date(2020, 0, 1),
      endDate: new Date(2020, 4, 15),
    },
  ]),
  down: (queryInterface) => queryInterface.bulkDelete('Semesters', null, {}),
};
