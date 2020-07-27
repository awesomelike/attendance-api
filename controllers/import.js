import models from '../models';
import random from '../util/random';

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

export const storeTimetable = (req, res) => {
  const { timetable } = req.timetable;
  const courses = [];
  const professors = [];
  const rooms = [];
  timetable.forEach((object) => {
    courses.push({
      courseNumber: object.courseNumber,
      name: object.courseName,
    });
    professors.push({
      uid: object.professorId,
      name: object.professorName,
      rfid: object.rfid || random(8),
      accountId: object.accountId,
    });
    rooms.push({
      label: object.room,
    });
  });
};

export default {
  handleImport(req, res) {
    const { students, timetable } = req.timetable;
  },
};
