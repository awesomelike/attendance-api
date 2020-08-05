import { checkSchema, validationResult } from 'express-validator/check';
import random from '../random';

const referencePropsTimetable = [
  'Course No.',
  'Class No',
  'Course Title',
  'Prof.ID',
  'Prof.name',
  'Lecture day',
  'Lecture time',
  'Classroom',
];

const referencePropsStudents = [
  'Dept.',
  'Major',
  'Student ID',
  'Name',
  'School Year',
  'Course No',
  'Class No',
];

const hasAll = (ref, obj) => {
  const keys = Object.keys(obj);

  for (let i = 0; i < ref.length; i += 1) {
    if (!keys.includes(ref[i])) return false;
  }
  return true;
};

export const checkTimetable = checkSchema({
  timetable: {
    isArray: true,
    custom: {
      options: (array) => array.every((object) => hasAll(referencePropsTimetable, object)),
      errorMessage: 'Timetable file column names do not match reference names',
    },
  },
  students: {
    isArray: true,
    custom: {
      options: (array) => array.every((object) => hasAll(referencePropsStudents, object)),
      errorMessage: 'Students file column names do not match reference names',
    },
  },
});

export function validateTimetable(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(403).json({ errors: errors.array() });
  }
  req.timetable = {
    timetable: req.body.timetable,
    students: req.body.students.map((student) => ({
      uid: student['Student ID'],
      name: student.Name,
      rfid: student.rfid || random(8),
      schoolYear: student['School Year'],
      department: student['Dept.'],
      'Course No': student['Course No'],
      'Class No': student['Class No'],
    })),
  };
  next();
}
