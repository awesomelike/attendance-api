import models from '../models';
import random from '../util/random';
import { getSemesterTimeOffset } from '../util/time';

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
    await models.Student.bulkCreate(uniqueStudents, { returning: true, updateOnDuplicate: ['name'] });
    next();
  } catch (error) {
    res.status(502).json(error);
  }
};

export const storeTimetable = async (req, res) => {
  try {
    const { timetable, students: studentsTimetable } = req.timetable;
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
      models.Professor.bulkCreate(uniqueProfessors, { updateOnDuplicate: ['name'] }),
      models.Course.bulkCreate(uniqueCourses, { updateOnDuplicate: ['name'] }),
      models.Room.bulkCreate(uniqueRooms, { updateOnDuplicate: ['label'] }),
    ];

    await Promise.all(insertProfessorsCoursesRooms);
    professors = await models.Professor.findAll({ attributes: ['id', 'uid'], raw: true });
    courses = await models.Course.findAll({ raw: true });
    for (let i = 0; i < courses.length; i += 1) {
      const course = courses[i];
      const particularSections = timetable
        .filter(({ courseNumber }) => courseNumber === course.courseNumber);
      for (let j = 0; j < particularSections.length; j += 1) {
        const particularSection = particularSections[j];
        const particularClasses = particularSections
          .filter(({ sectionNumber }) => particularSection.sectionNumber === sectionNumber);
        sections.push({
          courseId: course.id,
          sectionNumber: particularSection.sectionNumber,
          professorId: professors
            .find(({ uid }) => uid === particularSection.professorId).id,
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
    await models.Section.bulkCreate(sectionsToInsert, { updateOnDuplicate: ['sectionNumber'] });

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
    });
    const weekDays = await models.WeekDay.findAll({ raw: true });
    rooms = await models.Room.findAll({ raw: true });
    const classesToInsert = [];
    for (let i = 0; i < uniqueSections.length; i += 1) {
      const { classes } = uniqueSections[i];
      const uniqueClasses = unique(classes, ['courseNumber', 'sectionNumber', 'weekDay']);
      for (let j = 0; j < uniqueClasses.length; j += 1) {
        const item = uniqueClasses[j];
        classesToInsert.push({
          sectionId: allSections
            .find(({ sectionNumber, course }) => sectionNumber === item.sectionNumber
            && course.courseNumber === item.courseNumber).id,
          weekDayId: weekDays
            .find((weekDay) => weekDay.key === item.weekDay).id,
          roomId: rooms.find(({ label }) => label === item.room).id,
          semesterId,
        });
      }
    }
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
      where: { semesterId },
    });
    const timeSlots = await models.TimeSlot.findAll({ raw: true });
    const classTimeSlots = [];
    for (let i = 0; i < uniqueSections.length; i += 1) {
      const { classes } = uniqueSections[i];
      classes.forEach(({
        weekDay, courseNumber, sectionNumber, timeslot,
      }) => {
        const classId = dbClasses
          .find(({ weekDayId, section }) => weekDayId === weekDays
            .find(({ key }) => key === weekDay).id
            && section.course.courseNumber === courseNumber
            && section.sectionNumber === sectionNumber).id;
        const timeSlotId = timeSlots
          .find((t) => t.startTime === timeslot).id;
        classTimeSlots.push({ timeSlotId, classId });
      });
    }
    await models.ClassTimeSlot.bulkCreate(classTimeSlots, { updateOnDuplicate: ['timeSlotId', 'classId'] });

    const semester = await models.Semester.findByPk(semesterId);
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

    // eslint-disable-next-line no-shadow
    classesWithTimeSlots.forEach(({ id, weekDayId, timeSlots }) => {
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
    await models.ClassItem.bulkCreate(classItems); // UPDATE_ON_DUPLICATE???

    const students = await models.Student.findAll();
    const studentSections = [];
    for (let i = 0; i < students.length; i += 1) {
      const particularStudents = studentsTimetable
        .filter((st) => st['Student ID'] === students[i].uid);
      for (let j = 0; j < particularStudents.length; j += 1) {
        studentSections.push({
          studentId: students.find((student) => particularStudents[j]['Student ID'] === student.uid).id,
          sectionId: allSections
            .find(({ courseId, sectionNumber }) => courseId === courses
              .find((course) => course.courseNumber === particularStudents[j]['Course No']).id
              && sectionNumber === particularStudents[j]['Class No']).id,
        });
      }
    }
    await models.StudentSection.bulkCreate(studentSections, { updateOnDuplicate: ['studentId', 'sectionId'] });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(502).json(error.message);
  }
};

export default {
  handleImport(req, res) {
    const { students, timetable } = req.timetable;
  },
};
