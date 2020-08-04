/* eslint-disable no-shadow */
import { extname } from 'path';
import moment from 'moment';
// import sequelize from 'sequelize';
import models, { sequelize } from '../models';
import random from '../util/random';
import { getSemesterTimeOffset } from '../util/time';
import { setNames } from './semester';
import versionAttr from '../util/versionAttr';

require('dotenv').config();

const unique = (arr, keyProps) => {
  const kvArray = arr.map((entry) => {
    const key = keyProps.map((k) => entry[k]).join('|');
    return [key, entry];
  });
  const map = new Map(kvArray);
  return Array.from(map.values());
};

export const storeStudents = async (req, res, next) => {
  try {
    const { students } = req.timetable;
    const uniqueStudents = unique(students, ['uid']);
    await models.Student.bulkCreate(uniqueStudents, {
      returning: true, updateOnDuplicate: ['name', 'schoolYear'],
    });
    next();
  } catch (error) {
    res.status(502).json(error);
  }
};

const storeStudentsSections = (
  semesterId,
  studentsTimetable,
  students,
  sections,
  courses,
  t,
) => new Promise((resolve, reject) => {
  console.log('sections', sections.slice(0, 5));
  console.log('courses', courses.slice(0, 5));
  const studentSections = [];
  for (let i = 0; i < students.length; i += 1) {
    const particularStudents = studentsTimetable
      .filter((st) => st.uid === students[i].uid);
    for (let j = 0; j < particularStudents.length; j += 1) {
      studentSections.push({
        studentId: students.find((student) => particularStudents[j].uid === student.uid).id,
        sectionId: sections
          .find(({ courseId, sectionNumber }) => courseId === courses
            .find((course) => course.courseNumber === particularStudents[j]['Course No']).id
                && sectionNumber === particularStudents[j]['Class No']).id,
        semesterId,
      });
    }
  }
  models.StudentSection.destroy({ where: { semesterId }, transaction: t })
    .then(() => models.StudentSection.bulkCreate(studentSections, {
      updateOnDuplicate: ['studentId', 'sectionId'],
      transaction: t,
    }))
    .then(() => resolve(true))
    .catch((error) => reject(error));
});

export const storeTimetable = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { timetable, students: studentsTimetable } = req.timetable;
    console.log('timetable length: ', timetable.length);
    console.log('students length', studentsTimetable.length);

    const semesterId = parseInt(req.params.id, 10);
    let courses = [];
    let professors = [];
    let rooms = [];
    const sections = [];

    timetable.forEach((object) => {
      courses.push({
        courseNumber: object['Course No.'],
        name: object['Course Title'],
      });
      professors.push({
        uid: object['Prof.ID'],
        name: object['Prof.name'],
        rfid: object.rfid || random(8), // Remove random
        accountId: object.accountId,
      });
      rooms.push({
        label: object.Classroom,
      });
    });

    const uniqueCourses = unique(courses, ['courseNumber']);
    const uniqueProfessors = unique(professors, ['uid']);
    const uniqueRooms = unique(rooms, ['label']);

    const insertProfessorsCoursesRooms = [
      models.Professor.bulkCreate(uniqueProfessors, { updateOnDuplicate: ['name'], transaction: t }),
      models.Course.bulkCreate(uniqueCourses, { updateOnDuplicate: ['name'], transaction: t }),
      models.Room.bulkCreate(uniqueRooms, { updateOnDuplicate: ['label'], transaction: t }),
    ];

    await Promise.all(insertProfessorsCoursesRooms);

    professors = await models.Professor.findAll({ attributes: ['id', 'uid'], raw: true, transaction: t });
    courses = await models.Course.findAll({ raw: true, transaction: t });

    for (let i = 0; i < courses.length; i += 1) {
      const course = courses[i];
      const particularSections = timetable
        .filter((t) => t['Course No.'] === course.courseNumber);
      for (let j = 0; j < particularSections.length; j += 1) {
        const particularSection = particularSections[j];
        const particularClasses = particularSections
          .filter((s) => particularSection['Class No'] === s['Class No']);
        sections.push({
          courseId: course.id,
          sectionNumber: particularSection['Class No'],
          professorId: professors
            .find(({ uid }) => uid === particularSection['Prof.ID']).id,
          semesterId,
          classes: particularClasses,
        });
      }
    }
    const uniqueSections = unique(sections, ['sectionNumber', 'courseId', 'semesterId']);
    const sectionsToInsert = uniqueSections.map(({
      courseId, sectionNumber, professorId, semesterId: semId,
    }) => ({
      courseId, sectionNumber, professorId, semesterId: semId,
    }));
    await models.Section.bulkCreate(sectionsToInsert, {
      updateOnDuplicate: ['professorId'],
      transaction: t,
    });
    const allSections = await models.Section.findAll({
      where: { semesterId },
      attributes: ['id', 'sectionNumber', 'courseId'],
      include: [
        {
          model: models.Course,
          as: 'course',
          attributes: ['courseNumber'],
        },
      ],
      raw: true,
      transaction: t,
    });

    const weekDays = await models.WeekDay.findAll({ raw: true, transaction: t });
    rooms = await models.Room.findAll({ raw: true, transaction: t });

    const classesToInsert = [];
    let count = 1;
    for (let i = 0; i < uniqueSections.length; i += 1) {
      const { classes } = uniqueSections[i];
      const uniqueClasses = unique(classes, ['Course No.', 'Class No', 'Lecture day']);
      for (let j = 0; j < uniqueClasses.length; j += 1) {
        const item = uniqueClasses[j];
        classesToInsert.push({
          sectionId: allSections
            .find((s) => s.sectionNumber === item['Class No']
              && s['course.courseNumber'] === item['Course No.']).id,
          weekDayId: weekDays
            .find((weekDay) => weekDay.key === item['Lecture day']).id,
          roomId: rooms.find(({ label }) => label === item.Classroom).id,
          semesterId,
          // eslint-disable-next-line no-plusplus
          index: count++,
        });
      }
    }
    await models.Class.bulkCreate(classesToInsert, {
      updateOnDuplicate: ['roomId', 'weekDayId'],
      transaction: t,
    });
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
      where: { semesterId },
      transaction: t,
    });

    const timeSlots = await models.TimeSlot.findAll({ raw: true, transaction: t });
    const classTimeSlots = [];
    for (let i = 0; i < uniqueSections.length; i += 1) {
      const { classes } = uniqueSections[i];
      classes.forEach(({
        'Lecture day': weekDay,
        'Course No.': courseNumber,
        'Class No': sectionNumber,
        'Lecture time': timeslot,
      }) => {
        const classId = dbClasses
          .find(({ weekDayId, section }) => weekDayId === weekDays
            .find(({ key }) => key === weekDay).id
              && section.course.courseNumber === courseNumber
              && section.sectionNumber === sectionNumber).id;
        const timeSlotId = timeSlots
          .find((t) => t.startTime === timeslot).id;
        classTimeSlots.push({ timeSlotId, classId, semesterId });
      });
    }
    await models.ClassTimeSlot.destroy({ where: { semesterId }, transaction: t });
    await models.ClassTimeSlot.bulkCreate(classTimeSlots, {
      updateOnDuplicate: ['timeSlotId', 'classId'],
      transaction: t,
    });

    const semester = await models.Semester.findByPk(semesterId, { transaction: t });
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
      transaction: t,
    });

    classesWithTimeSlots.forEach(({ id, weekDayId, timeSlots }) => {
      if (!timeSlots.length) console.log(id);
      for (let week = 1; week <= 16; week += 1) {
        if (week !== 8 && week !== 16) {
          classItems.push({
            classId: id,
            week,
            plannedDate: getSemesterTimeOffset(semester.startDate, { weekDayId, timeSlots }, week),
            classItemStatusId: 1,
            semesterId,
          });
        }
      }
    });
    await models.ClassItem.bulkCreate(classItems, {
      updateOnDuplicate: ['plannedDate', 'week'],
      transaction: t,
    });

    const students = await models.Student.findAll({ raw: true, transaction: t });
    await storeStudentsSections(semesterId, studentsTimetable, students, allSections, courses, t);

    // We reached here, so there is no error, we can safely commit the transaction
    await t.commit();

    res.sendStatus(200);
  } catch (error) {
    // There is some error, so we rollback the transaction
    await t.rollback();

    console.log(error);
    res.status(502).json(error.message);
  }
};

export const filter = (req, res, next) => {
  if (!req.files) return res.status(400).json({ error: 'No files provied' });
  const { timetable, students } = req.files;

  const isValid = (mimetype) => mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || mimetype === 'application/vnd.ms-excel';
  if (timetable) {
    if (!isValid(timetable.mimetype)) return res.status(400).json({ error: 'Invalid mimetype!' });
  }
  if (students) {
    if (!isValid(students.mimetype)) return res.status(400).json({ error: 'Invalid mimetype!' });
  }
  next();
};

const getLastVersion = (semesterId) => models.TimetableVersion.max('version', { where: { semesterId } });

export const upload = async (req, res) => {
  try {
    const semesterId = parseInt(req.params.id, 10);
    const semester = await models.Semester.findByPk(semesterId, { raw: true });
    if (!semester) { throw new Error('No semester found'); }
    const { timetable, students } = req.files;
    if (!timetable && !students) { throw new Error('No files provied!'); }

    const { year, season } = semester;
    const lastVersion = await getLastVersion(semesterId);
    const newVersion = lastVersion ? lastVersion + 1 : 1;

    const fileName = (type, name) => `/storage/${season}${year}_v${newVersion}_${type}_${moment().format('DD-MM-YYYY')}${extname(name)}`;

    const timetableVersion = {
      semesterId,
      version: newVersion,
      addedById: req.account.id,
    };

    if (timetable) {
      const path = fileName('Timetable', timetable.name);
      timetable.mv(`.${path}`, (error) => {
        if (error) { throw new Error(error); }
      });
      timetableVersion.fileTimetable = path;
    }
    if (students) {
      const path = fileName('Students', students.name);
      students.mv(`.${path}`, (error) => {
        if (error) { throw new Error(error); }
      });
      timetableVersion.fileStudents = path;
    }

    const { id } = await models.TimetableVersion.create(timetableVersion);
    const created = await models.TimetableVersion.findByPk(id, {
      attributes: versionAttr,
      include: [
        {
          model: models.Account,
          as: 'addedBy',
        },
      ],
    });

    setNames(created);

    res.status(200).json(created);
  } catch (error) {
    console.log(error);
    res.status(502).json({ error: error.message });
  }
};
