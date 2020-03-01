
module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert('StudentSections', [
    {
      id: 1,
      studentId: 1,
      sectionId: 1,
    }, {
      id: 2,
      studentId: 1,
      sectionId: 2,
    }, {
      id: 3,
      studentId: 3,
      sectionId: 1,
    },
  ]),

  down: (queryInterface) => queryInterface.bulkDelete('StudentSections', null, {}),
};
