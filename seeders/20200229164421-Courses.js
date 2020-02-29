
module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert('Courses', [
    {
      id: 1,
      name: 'Statistics',
    }, {
      id: 2,
      name: 'Economics',
    },
  ]),

  down: (queryInterface) => queryInterface.bulkDelete('Courses', null, {}),
};
