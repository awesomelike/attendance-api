module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert('Roles', [
    {
      id: 1,
      name: 'Academic Affairs',
    },
    {
      id: 2,
      name: 'Professor',
    },
  ]),
  down: (queryInterface) => queryInterface.bulkDelete('Roles', null, {}),
};
