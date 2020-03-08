import { writeFileSync } from 'fs';
import models from '../models';
import timetable from '../data/timetable.json';
import studentsTimetable from '../data/students.json';

function unique(arr, keyProps) {
  const kvArray = arr.map((entry) => {
    const key = keyProps.map((k) => entry[k]).join('|');
    return [key, entry];
  });
  const map = new Map(kvArray);
  return Array.from(map.values());
}

const storeTimetable = (req, res) => {
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
      const coursesFromDB = await models.Course.findAll();
      for (let i = 0; i < coursesFromDB.length; i += 1) {
        const particularSections = timetable
          .filter((object) => object.courseNumber === coursesFromDB[i].courseNumber);
        for (let j = 0; j < particularSections.length; j += 1) {
          const particularClasses = particularSections
            .filter((section) => particularSections[j].sectionNumber === section.sectionNumber);
          sections.push({
            courseId: coursesFromDB[i].id,
            sectionNumber: particularSections[j].sectionNumber,
            professorId: professorsFromDB
              .find((professor) => professor.uid === particularSections[j].professorId).id,
            semesterId: 2,
            // classes: particularClasses,
          });
        }
      }
      models.sequelize.getQueryInterface().bulkInsert('Sections',
        unique(sections, ['sectionNumber', 'courseId', 'semesterId']), {})
        .then(() => res.send(200))
        .catch((error) => res.status(502).json({ error }));
    })
    .catch((error) => res.status(502).json(error));
};

const storeStudents = (req, res) => {
  const students = [];
  studentsTimetable.forEach((obj) => {
    students.push({
      uid: obj['Student ID'],
      name: obj.Name,
    });
  });

  const uniqueStudents = Array.from(new Set(students.map((student) => student.uid)))
    .map((uid) => students.find((student) => student.uid === uid));
  models.sequelize.getQueryInterface().bulkInsert('Students', uniqueStudents, {})
    .then(() => {
      console.log('Students inserted');
    });
};

export default {
  handlePost(req, res) {
    storeTimetable(req, res);
    storeStudents(req, res);
  },
};
