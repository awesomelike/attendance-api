
module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert('Courses', [
    {
      id: 1,
      name: 'Statistics',
      courseNumber: 'TSF1311',
    }, {
      id: 2,
      name: 'Economics',
      courseNumber: 'NTS3040',
    },
  ]),

  down: (queryInterface) => queryInterface.bulkDelete('Courses', null, {}),
};
