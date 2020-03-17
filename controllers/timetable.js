import moment from 'moment';
import { Op } from 'sequelize';
import models from '../models';
import timetable from '../data/timetable.json';
import studentsTimetable from '../data/students.json';
import random from '../util/random';
import { parseTime } from '../util/time';

function unique(arr, keyProps) {
  const kvArray = arr.map((entry) => {
    const key = keyProps.map((k) => entry[k]).join('|');
    return [key, entry];
  });
  const map = new Map(kvArray);
  return Array.from(map.values());
}

const storeTimetable = (req, res) => new Promise((resolve, reject) => {
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
      rfid: obj.rfid || random(8),
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
          const weekDays = await models.WeekDay.findAll({ raw: true });
          const classesToInsert = [];
          for (let i = 0; i < uniqueSections.length; i += 1) {
            const { classes } = uniqueSections[i];
            const uniqueClasses = unique(classes, ['courseNumber', 'sectionNumber', 'weekDay']);
            for (let j = 0; j < uniqueClasses.length; j += 1) {
              classesToInsert.push({
                sectionId: allSections
                  .find((section) => section.sectionNumber === uniqueClasses[j].sectionNumber
                  && section.course.courseNumber === uniqueClasses[j].courseNumber).id,
                weekDayId: weekDays
                  .find((weekDay) => weekDay.key === uniqueClasses[j].weekDay).id,
                room: uniqueClasses[j].room,
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
                classes.forEach((inclass) => {
                  const classId = dbClasses
                    .find((obj) => obj.weekDayId === weekDays
                      .find((wd) => wd.key === inclass.weekDay).id
                      && obj.section.course.courseNumber === inclass.courseNumber
                      && obj.section.sectionNumber === inclass.sectionNumber).id;
                  const timeSlotId = timeSlots
                    .find((timeslot) => timeslot.startTime === inclass.timeslot).id;
                  classTimeSlots.push({ timeSlotId, classId });
                });
              }
              models.sequelize.getQueryInterface().bulkInsert('ClassTimeSlots', classTimeSlots, {})
                .then(() => {
                  const classItems = [];
                  dbClasses.forEach((dbClass) => {
                    for (let i = 1; i <= 16; i += 1) {
                      if (i !== 8 && i !== 16) {
                        classItems.push({
                          classId: dbClass.id,
                          week: i,
                        });
                      }
                    }
                  });
                  models.sequelize.getQueryInterface().bulkInsert('ClassItems', classItems, {})
                    .then(async () => {
                      const students = await models.Student.findAll();
                      const dbSections = await models.Section.findAll();
                      const dbCourses = await models.Course.findAll();
                      const studentSections = [];
                      for (let i = 0; i < students.length; i += 1) {
                        const particularStudents = studentsTimetable
                          .filter((st) => st['Student ID'] === students[i].uid);
                        for (let j = 0; j < particularStudents.length; j += 1) {
                          studentSections.push({
                            studentId: students.find((student) => particularStudents[j]['Student ID'] === student.uid).id,
                            sectionId: dbSections
                              .find((section) => section.courseId === dbCourses
                                .find((course) => course.courseNumber === particularStudents[j]['Course No']).id
                                && section.sectionNumber === particularStudents[j]['Class No']).id,
                          });
                        }
                      }
                      models.sequelize.getQueryInterface().bulkInsert('StudentSections', studentSections, {})
                        .then(async () => {
                          resolve('success');
                        });
                    });
                })
                .catch((error) => res.status(502).json(error));
            });
        })
        .catch((error) => res.status(502).json(error));
    });
});

const storeStudents = () => {
  const students = [];
  studentsTimetable.forEach((obj) => {
    students.push({
      uid: obj['Student ID'],
      name: obj.Name,
      rfid: obj.rfid || random(8),
    });
  });

  const uniqueStudents = Array.from(new Set(students.map((student) => student.uid)))
    .map((uid) => students.find((student) => student.uid === uid));
  models.sequelize.getQueryInterface().bulkInsert('Students', uniqueStudents, {})
    .then(() => {
      console.log('Students inserted');
    });
};

const insertDummyRecords = async (req, res) => {
  const semester = await models.Semester.findByPk(2);
  const classes = await models.Class.findAll({
    include: [
      {
        model: models.ClassItem,
        as: 'classItems',
        where: {
          week: { [Op.lt]: 8 },
        },
      },
      {
        model: models.Section,
        as: 'section',
        include: [
          {
            model: models.Student,
            as: 'students',
          },
        ],
      },
      {
        model: models.TimeSlot,
        as: 'timeSlots',
      },
    ],
  }, { raw: true });
  console.log(classes);
  const tasks = [];
  for (let i = 0; i < parseInt(classes.length / 15, 10); i += 1) {
    const { classItems } = classes[i];
    for (let j = 0; j < classItems.length; j += 1) {
      tasks.push(models.ClassItem.update({
        date: moment(semester.startDate)
          .add(classes[i].weekDayId - 1, 'days')
          .add(parseTime(classes[i].timeSlots[0].startTime).hour, 'hours')
          .add(parseTime(classes[i].timeSlots[0].startTime).minute, 'minutes')
          .add(classItems[j].week - 1, 'weeks'),
      }, { where: { id: classItems[j].id } }));
    }
  }
  Promise.all(tasks)
    .then(() => {
      // const newTasks = [];
      const records = [];
      for (let i = 0; i < parseInt(classes.length / 15, 10); i += 1) {
        const { classItems } = classes[i];
        for (let j = 0; j < classItems.length; j += 1) {
          const { students } = classes[i].section;
          for (let k = 0; k < students.length; k += 1) {
            records.push({
              classItemId: classItems[j].id,
              studentId: students[k].id,
              rfid: students[k].rfid,
              isAttended: Math.random() < 0.9 ? 1 : 0,
              isAdditional: 0,
            });
          }
        }
      }
      models.sequelize.getQueryInterface().bulkInsert('Records', records, {})
        .then(() => res.sendStatus(200))
        .catch((error) => res.status(502).json(error));
      // Promise.all(newTasks)
      //   .then(() => res.sendStatus(200))
      //   .catch((error) => res.status(502).json(error));
    })
    .catch((error) => res.status(502).json(error));
};

export default {
  async handlePost(req, res) {
    await storeStudents(req, res);
    await storeTimetable(req, res);
    await insertDummyRecords(req, res);
  },
};
