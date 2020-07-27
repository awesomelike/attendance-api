import moment from 'moment';
import { Op } from 'sequelize';
import models from '../models';
import timetable from '../data/timetable.json';
import studentsTimetable from '../data/students.json';
import mobiles from '../data/mobiles.json';
import random from '../util/random';
import { getSemesterTimeOffset } from '../util/time';

function unique(arr, keyProps) {
  const kvArray = arr.map((entry) => {
    const key = keyProps.map((k) => entry[k]).join('|');
    return [key, entry];
  });
  const map = new Map(kvArray);
  return Array.from(map.values());
}

const storeTimetable = (req, res) => new Promise(() => {
  const courses = [];
  const professors = [];
  const sections = [];
  const rooms = [];
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
      accountId: obj.accountId,
    });
    rooms.push({
      label: obj.room,
    });
  });

  // Uniqify the arrays
  const uniqueCourses = Array.from(new Set(courses.map((course) => course.courseNumber)))
    .map((courseNumber) => courses.find((course) => course.courseNumber === courseNumber));
  const uniqueProfessors = Array.from(new Set(professors.map((professor) => professor.uid)))
    .map((uid) => professors.find((professor) => professor.uid === uid));
  const uniqueRooms = unique(rooms, ['label']);
  // Make an array of tasks/promises
  const insertProfessorsAndCourses = [
    // models.sequelize.getQueryInterface().bulkInsert('Professors', uniqueProfessors, {}),
    // models.sequelize.getQueryInterface().bulkInsert('Courses', uniqueCourses, {}),
    // models.sequelize.getQueryInterface().bulkInsert('Rooms', uniqueRooms, {}),
    models.Professor.bulkCreate(uniqueProfessors, { updateOnDuplicate: ['name'] }),
    models.Course.bulkCreate(uniqueCourses, { updateOnDuplicate: ['name'] }),
    models.Room.bulkCreate(uniqueRooms, { updateOnDuplicate: ['label'] }),
  ];

  Promise.all(insertProfessorsAndCourses)
    .then(async () => {
      try {
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

        // models.sequelize.getQueryInterface().bulkInsert('Sections', sectionsToInsert, {})
        await models.Section.bulkCreate(sectionsToInsert, { updateOnDuplicate: ['sectionNumber'] });
        const allSections = await models.Section.findAll({
          include: [
            {
              model: models.Course,
              as: 'course',
            },
          ],
        });
        const weekDays = await models.WeekDay.findAll({ raw: true });
        const dbRooms = await models.Room.findAll({ raw: true });
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
              roomId: dbRooms.find(({ label }) => label === uniqueClasses[j].room).id,
            });
          }
        }
        // models.sequelize.getQueryInterface().bulkInsert('Classes', classesToInsert)
        await models.Class.bulkCreate(classesToInsert, { updateOnDuplicate: ['sectionId', 'roomId', 'weekDayId'] });
        const classInclude = [
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
        ];
        const dbClasses = await models.Class.findAll({
          include: classInclude,
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
        await models.ClassTimeSlot.bulkCreate(classTimeSlots, { updateOnDuplicate: ['timeSlotId', 'classId'] });
        const semester = await models.Semester.findByPk(2);
        const classItems = [];
        const classesWithTimeSlots = await models.Class.findAll({
          include: [
            ...classInclude,
            {
              model: models.TimeSlot,
              as: 'timeSlots',
              through: { attributes: [] },
            },
          ],
        });
        classesWithTimeSlots.forEach((dbClass) => {
          for (let i = 1; i <= 16; i += 1) {
            if (i !== 8 && i !== 16) {
              classItems.push({
                classId: dbClass.id,
                week: i,
                plannedDate: getSemesterTimeOffset(semester.startDate, dbClass, i),
                classItemStatusId: 1,
              });
            }
          }
        });
        // models.sequelize.getQueryInterface().bulkInsert('ClassItems', classItems, {})
        await models.ClassItem.bulkCreate(classItems);
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
        // models.sequelize.getQueryInterface().bulkInsert('StudentSections', studentSections, {})
        await models.StudentSection.bulkCreate(studentSections, { updateOnDuplicate: ['studentId', 'sectionId'] });
        res.sendStatus(200);
      } catch (error) {
        console.log(error);
        res.status(502).json(error);
      }
    });
});

const storeStudents = async (req, res) => {
  try {
    const students = [];
    studentsTimetable.forEach((obj) => {
      students.push({
        uid: obj['Student ID'],
        name: obj.Name,
        rfid: obj.rfid || random(8),
        schoolYear: obj['School Year'],
        department: obj['Dept.'],
      });
    });

    const uniqueStudents = Array.from(new Set(students.map((student) => student.uid)))
      .map((uid) => students.find((student) => student.uid === uid));
    await models.Student.bulkCreate(uniqueStudents, { returning: true, updateOnDuplicate: ['name'] });
  } catch (error) {
    res.status(502).json(error);
  }
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
  const tasks = [];
  for (let i = 0; i < parseInt(classes.length / 3, 10); i += 1) {
    const { classItems } = classes[i];
    const arrayToUpdate = [];
    for (let j = 0; j < classItems.length; j += 1) {
      arrayToUpdate.push({
        id: classItems[j].id,
        // plannedDate: getSemesterTimeOffset(semester.startDate, classes[i], classItems[j].week),
        date: getSemesterTimeOffset(semester.startDate, classes[i], classItems[j].week),
        classItemStatusId: 3,
      });
    }
    tasks.push(models.ClassItem.bulkCreate(arrayToUpdate, {
      updateOnDuplicate: ['date', 'classItemStatusId'],
    }));
  }
  Promise.all(tasks)
    .then(() => {
      const records = [];
      for (let i = 0; i < parseInt(classes.length / 3, 10); i += 1) {
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
    })
    .catch((error) => res.status(502).json(error));
};

export default {
  async handlePostTimetable(req, res) {
    await storeStudents(req, res);
    await storeTimetable(req, res);
  },
  async handlePostRecords(req, res) {
    await insertDummyRecords(req, res);
  },
  async handlePostTelegram(req, res) {
    const telegramAccounts = [];
    const students = await models.Student.findAll({ raw: true });
    mobiles.forEach((mobile) => {
      telegramAccounts.push({
        studentId: students.find(({ uid }) => uid === mobile.uid).id,
        phoneNumber: mobile.phoneNumber,
      });
    });
    // models.sequelize.getQueryInterface().bulkInsert('TelegramAccounts', telegramAccounts, {})
    await models.TelegramAccount.bulkCreate(telegramAccounts);
    console.log('Telegram accounts inserted!');
    res.sendStatus(200);
  },
  getProfessorTimetable(req, res) {
    const { id } = req.params;
    models.Professor.findOne({
      where: {
        id,
      },
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      include: [
        {
          model: models.Section,
          as: 'sections',
          attributes: ['sectionNumber', 'courseId'],
          include: [
            {
              model: models.Course,
              as: 'course',
              attributes: { exclude: ['createdAt', 'updatedAt'] },
            },
            {
              model: models.Class,
              as: 'classes',
              attributes: { exclude: ['createdAt', 'updatedAt'] },
              include: [
                {
                  model: models.WeekDay,
                  as: 'weekDay',
                },
                {
                  model: models.TimeSlot,
                  as: 'timeSlots',
                  through: {
                    attributes: [],
                  },
                },
              ],
            },
          ],
        },
      ],
    })
      .then((result) => res.status(200).json(result))
      .catch((error) => res.status(502).json(error));
  },
  getDayTimetable(req, res) {
    const { weekDayId } = req.params;
    models.WeekDay.findAll({
      where: {
        id: weekDayId,
      },
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      include: [
        {
          model: models.Class,
          as: 'classes',
          include: [
            {
              model: models.Section,
              as: 'section',
              attributes: ['sectionNumber', 'courseId'],
              include: [
                {
                  model: models.Professor,
                  as: 'professor',
                  attributes: { exclude: ['createdAt', 'updatedAt'] },
                },
                {
                  model: models.Course,
                  as: 'course',
                  attributes: { exclude: ['createdAt', 'updatedAt'] },
                },
              ],
            },
            {
              model: models.TimeSlot,
              as: 'timeSlots',
              through: {
                attributes: [],
              },
            },
          ],
        },
      ],
    })
      .then((result) => res.status(200).json(result))
      .catch((error) => res.status(502).json(error));
  },
  async getDateTimetable(req, res) {
    models.ClassItem.findAll({
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    })
      .then((result) => {
        const neededClasses = result
          .filter(({ date }) => moment(date).startOf('day').valueOf() === moment(Number(req.params.date)).startOf('day').valueOf());
        models.ClassItem.findAll({
          where: {
            id: {
              [Op.in]: neededClasses.map(({ id }) => id),
            },
          },
          include: [
            {
              model: models.Class,
              as: 'class',
              attributes: { exclude: ['createdAt', 'updatedAt'] },
              include: [
                {
                  model: models.WeekDay,
                  as: 'weekDay',
                },
                {
                  model: models.Section,
                  as: 'section',
                  attributes: { exclude: ['createdAt', 'updatedAt'] },
                  include: [
                    {
                      model: models.Professor,
                      as: 'professor',
                      attributes: { exclude: ['createdAt', 'updatedAt'] },
                    },
                    {
                      model: models.Course,
                      as: 'course',
                      attributes: { exclude: ['createdAt', 'updatedAt'] },
                    },
                  ],
                },
                {
                  model: models.TimeSlot,
                  as: 'timeSlots',
                  through: {
                    attributes: [],
                  },
                },
              ],
            },
          ],
        })
          .then((finalResult) => res.status(200).json(finalResult));
      })
      .catch((error) => { res.status(502).json(error); });
  },
};
