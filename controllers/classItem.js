import moment from 'moment';
import models from '../models';
import { GOING_ON, FINISHED } from '../constants/classItems';
import { executeMissedAtDangerZone } from '../util/sql/missedClasses';
import { sendEmail, missedClassesNotification } from '../tasks/email';
import time from '../util/time';
import makeOptions from '../util/queryOptions';
import { getCurrentSemester } from './semester';

const { ClassItem } = models;

const includeWithStudents = [
  {
    model: models.Record,
    as: 'records',
    include: [
      {
        model: models.Student,
        as: 'student',
      },
    ],
  },
];

const includeWithCourse = [
  {
    model: models.Class,
    as: 'class',
    attributes: ['id', 'sectionId'],
    include: [
      {
        model: models.Section,
        as: 'section',
        attributes: ['id', 'professorId'],
        include: [
          {
            model: models.Course,
            as: 'course',
            attributes: ['id', 'name'],
          },
        ],
      },
    ],
  },
];

export function isTaughtBy(classItemId, professorId) {
  return new Promise((resolve, reject) => {
    ClassItem.findByPk(classItemId, { include: includeWithCourse })
      .then((classItem) => resolve(classItem.class.section.professorId === professorId))
      .catch((error) => reject(error));
  });
}

function notifyStudents(students) {
  return new Promise((resolve, reject) => {
    const tasks = [];
    console.log('students.length', students.length);
    students.forEach(({
      email, name, CourseName, MissedClasses,
    }) => {
      tasks.push(
        sendEmail(missedClassesNotification(
          email,
          name,
          CourseName,
          MissedClasses,
        )),
      );
    });
    Promise.all(tasks)
      .then((result) => resolve(result))
      .catch((error) => { console.log(error); reject(error); });
  });
}

export default {
  async getAll(req, res) {
    try {
      const classItems = await ClassItem.findAll(makeOptions(req, {
        include: includeWithStudents,
      }));
      res.status(200).json(classItems);
    } catch (error) {
      res.status(502).json(error);
    }
  },
  async get(req, res) {
    try {
      const classItemWithRecords = await ClassItem.findByPk(req.params.id, {
        include: includeWithStudents,
      });
      res.status(200).json(classItemWithRecords);
    } catch (error) {
      console.log(error);
      res.status(502).json(error.message);
    }
  },
  async getExcel(req, res) {
    const classItemWithRecords = await ClassItem.findByPk(req.params.id, {
      include: includeWithStudents,
    });
    const data = classItemWithRecords.records.map(({ student, isAttended, attendedAt }) => ({
      ID: student.uid,
      Name: student.name,
      Attended: isAttended,
      Time: attendedAt ? moment(attendedAt).format('DD.MM.YYYY HH:mm') : '-',
    }));
    return res.xls(`ClassReport_${classItemWithRecords.id}.xlsx`, data);
  },
  async finishClass(req, res) {
    try {
      const { rfid } = req;
      const classItemId = req.params.id;
      const { id: semesterId } = await getCurrentSemester();

      const professor = await models.Professor.findOne({ where: { rfid } });
      if (!professor) return res.status(404).json({ error: 'No such professor' });

      const classItem = await ClassItem.findByPk(classItemId, { include: includeWithCourse });
      if (!classItem) return res.status(404).json({ error: 'No such class item' });

      if (classItem.classItemStatusId !== GOING_ON) {
        return res.status(403).json({
          error: 'This class has invalid status. So it cannot be finished!',
        });
      }
      if (!(await isTaughtBy(classItemId, professor.id))) {
        return res.status(403).json({
          error: 'This class is not taught by this professor',
        });
      }
      res.sendStatus(200);
      const records = await classItem.getRecords({
        attributes: ['id', 'studentId'],
        include: [
          {
            model: models.Student,
            as: 'student',
            attributes: ['id'],
          },
        ],
      });
      models.Student.update({
        inClass: false,
      }, {
        where: { id: records.map(({ student: { id } }) => id) },
      });
      classItem.update({ classItemStatusId: FINISHED });

      const currentWeek = await time.getCurrentWeek();
      const courseId = classItem.class.section.course.id;
      const dangerZoneStudents = await executeMissedAtDangerZone(currentWeek, courseId, semesterId);
      if (dangerZoneStudents.length) {
        notifyStudents(dangerZoneStudents);
      }
    } catch (error) {
      console.log(error.message);
      res.status(502).json(error);
    }
  },
};
