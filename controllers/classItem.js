import models from '../models';
import findWithPagination, { needsPagination } from '../util/pagination';
import { GOING_ON, FINISHED } from '../constants/classItems';
import { executeMissedAtDangerZone } from '../util/sql/missedClasses';
import { sendEmail, missedClassesNotification } from '../tasks/email';
import time from '../util/time';

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

function find(where, res, next) {
  ClassItem.findAll({
    where,
    include: includeWithStudents,
  })
    .then((classItems) => next(classItems))
    .catch((error) => res.status(502).json(error));
}

export function isTaughtBy(classItemId, professorId) {
  return new Promise((resolve, reject) => {
    ClassItem.findByPk(classItemId, {
      include: includeWithCourse,
    })
      .then((classItem) => resolve(classItem.class.section.professorId === professorId))
      .catch((error) => reject(error));
  });
}

function notifyStudents(students) {
  return new Promise((resolve, reject) => {
    const tasks = [];
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
      .catch((error) => reject(error));
  });
}

export default {
  getAll(req, res) {
    if (needsPagination(req)) {
      findWithPagination(ClassItem, includeWithStudents, {
        page: Number(req.query.page),
        size: Number(req.query.size),
      }, null, res, (classItems) => res.status(200).json(classItems));
    } else find(null, res, (classItems) => res.status(200).json(classItems));
  },
  async get(req, res) {
    try {
      const classItemWithRecords = await ClassItem.findByPk(req.params.id, {
        include: includeWithStudents,
      }, {
        raw: true,
      });
      if (classItemWithRecords) {
        if (req.query.format === 'excel') {
          const data = classItemWithRecords.records.map(({ student, isAttended }) => ({
            Name: student.name,
            Attended: isAttended,
          }));
          return res.xls(`ClassReport_${classItemWithRecords.id}.xlsx`, data);
        }
        res.status(200).json(classItemWithRecords);
      } else res.sendStatus(404);
    } catch (error) {
      res.status(502).json(error);
    }
  },
  async finishClass(req, res) {
    try {
      const { rfid } = req;
      const classItemId = req.params.id;

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
      classItem.update({ classItemStatusId: FINISHED });
      const dangerZoneStudents = await executeMissedAtDangerZone(
        time.getCurrentWeek(),
        classItem.class.section.course.name,
      );
      notifyStudents(dangerZoneStudents);
      res.sendStatus(200);
    } catch (error) {
      res.status(502).json(error);
    }
  },
};
