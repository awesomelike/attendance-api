
module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert('Sections', [
    {
      id: 1,
      sectionNumber: 1,
      professorId: 1,
      courseId: 1,
      semesterId: 1,
    },
    {
      id: 2,
      sectionNumber: 2,
      professorId: 1,
      courseId: 1,
      semesterId: 1,
    },
    {
      id: 3,
      sectionNumber: 1,
      professorId: 1,
      courseId: 2,
      semesterId: 1,
    },
    {
      id: 4,
      sectionNumber: 2,
      professorId: 1,
      courseId: 2,
      semesterId: 1,
    },
  ]),

  down: (queryInterface) => queryInterface.bulkDelete('Sections', null, {}),
};
