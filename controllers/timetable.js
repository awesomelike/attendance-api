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
            classes: particularClasses,
          });
        }
      }
      const uniqueSections = unique(sections, ['sectionNumber', 'courseId', 'semesterId']);

      const sectionsToInsert = uniqueSections.map(({
        courseId, sectionNumber, professorId, semesterId,
      }) => ({
        courseId, sectionNumber, professorId, semesterId,
      }));

      models.sequelize.getQueryInterface().bulkInsert('Sections', sectionsToInsert, {})
        .then(async () => {
          const allSections = await models.Section.findAll({
            include: [
              {
                model: models.Course,
                as: 'course',
              },
            ],
          });
          const classesToInsert = [];
          for (let i = 0; i < uniqueSections.length; i += 1) {
            const { classes } = uniqueSections[i];
            const uniqueClasses = unique(classes, ['courseNumber', 'sectionNumber', 'weekDay']);
            for (let j = 0; j < uniqueClasses.length; j += 1) {
              classesToInsert.push({
                sectionId: allSections
                  .find((section) => section.sectionNumber === uniqueClasses[j].sectionNumber
                && section.course.courseNumber === uniqueClasses[j].courseNumber).id,
                weekDay: uniqueClasses[j].weekDay,
                room: uniqueClasses[j].room,
                week: 1,
              });
            }
          }
          models.sequelize.getQueryInterface().bulkInsert('Classes', classesToInsert)
            .then(async () => {
              const dbClasses = await models.Class.findAll({
                include: [
                  {
                    model: models.Section,
                    as: 'section',
                    include: [
                      {
                        model: models.Professor,
                        as: 'professor',
                      },
                      {
                        model: models.Course,
                        as: 'course',
                      },
                    ],
                  },
                ],
              });
              const timeSlots = await models.TimeSlot.findAll({ raw: true });
              const classTimeSlots = [];
              for (let i = 0; i < uniqueSections.length; i += 1) {
                const { classes } = uniqueSections[i];
                // const uniqueClasses = unique(classes, ['courseNumber', 'sectionNumber', 'weekDay']);
                classes.forEach((inclass) => {
                  const classId = dbClasses
                    .find((obj) => obj.weekDay === inclass.weekDay
                    && obj.section.course.courseNumber === inclass.courseNumber
                    && obj.section.sectionNumber === inclass.sectionNumber).id;
                  const timeSlotId = timeSlots
                    .find((timeslot) => timeslot.startTime === inclass.timeslot).id;
                  classTimeSlots.push({ timeSlotId, classId });
                });
              }
              models.sequelize.getQueryInterface().bulkInsert('ClassTimeSlots', classTimeSlots, {})
                .then(() => res.sendStatus(200))
                .catch((error) => res.status(502).json(error));
            });
        })
        .catch((error) => res.status(502).json(error));
    });
};

const storeStudents = () => {
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
