module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert('Semesters', [
    {
      id: 1,
      year: 2019,
      season: 'Spring',
    }, {
      id: 2,
      year: 2019,
      season: 'Fall',
    }, {
      id: 3,
      year: 2020,
      season: 'Spring',
    },
  ]),
  down: (queryInterface) => queryInterface.bulkDelete('Semesters', null, {}),
};
