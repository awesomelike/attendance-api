import models from '../models';
import timetable from '../data/timetable.json';

export default {
  handlePost(req, res) {
    const courses = [];
    const professors = [];
    const sections = [];

    // Divide the data into multiple homogenous arrays
    timetable.forEach((obj) => {
      courses.push({
        courseNumber: obj.courseNumber,
        name: obj.courseName,
      });
      professors.push({
        uid: obj.professorId,
        name: obj.professorName,
      });
    });

    // Uniqify the arrays
    const uniqueCourses = Array.from(new Set(courses.map((course) => course.courseNumber)))
      .map((courseNumber) => courses.find((course) => course.courseNumber === courseNumber));
    const uniqueProfessors = Array.from(new Set(professors.map((professor) => professor.uid)))
      .map((uid) => professors.find((professor) => professor.uid === uid));

    // Make an array of tasks/promises
    const insertProfessorsAndCourses = [
      models.sequelize.getQueryInterface().bulkInsert('Professors', uniqueProfessors, {}),
      models.sequelize.getQueryInterface().bulkInsert('Courses', uniqueCourses, {}),
    ];

    Promise.all(insertProfessorsAndCourses)
      .then(async () => {
        const professorsFromDB = await models.Professor.findAll({ attributes: ['id', 'uid'] });
        const coursesFromDB = await models.Course.findAll({ attributes: ['id', 'courseNumber'] });

        timetable.forEach((obj) => {
          sections.push({
            sectionNumber: obj.sectionNumber,
            professorId: professorsFromDB.find((professor) => professor.uid === obj.professorId).id,
            courseId: coursesFromDB.find((course) => course.courseNumber === obj.courseNumber).id,
            semesterId: 2,
          });
        });
        models.sequelize.getQueryInterface().bulkInsert('Sections', sections, {})
          .then(() => res.send(200))
          .catch((error) => res.status(502).json({ error }));
      })
      .catch((error) => res.status(502).json(error));
  },
};
