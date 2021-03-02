import moment from 'moment';
import models, { sequelize } from '../models';
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

export async function isTaughtBy(classItemId, professorId) {
  const classItem = await ClassItem.findByPk(classItemId, { include: includeWithCourse });
  return classItem.class.section.professorId === professorId;
}

export async function notifyStudents(students) {
  const tasks = students.map(({
    email, name, CourseName, MissedClasses,
  }) => sendEmail(missedClassesNotification(
    email,
    name,
    CourseName,
    MissedClasses,
  )));
  await Promise.all(tasks);
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
    let t;
    try {
      const { rfid } = req;
      const classItemId = req.params.id;
      const semester = await getCurrentSemester();
      if (!semester) return res.status(403).json({ error: 'No ongoing semester right now!' });

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

      t = await sequelize.transaction();

      const records = await classItem.getRecords({
        attributes: ['id', 'studentId'],
        include: [
          {
            model: models.Student,
            as: 'student',
            attributes: ['id'],
          },
        ],
        transaction: t,
      });

      await models.Student.update({
        inClass: false,
      }, {
        where: { id: records.map(({ student: { id } }) => id) },
        transaction: t,
      });

      await classItem.update({ classItemStatusId: FINISHED }, { transaction: t });

      await t.commit();

      res.sendStatus(200);

      try {
        const { id: semesterId } = semester;
        const currentWeek = await time.getCurrentWeek();
        const courseId = classItem.class.section.course.id;
        const dangerZoneStudents = await executeMissedAtDangerZone(
          currentWeek,
          courseId,
          semesterId,
        );
        if (dangerZoneStudents.length) {
          notifyStudents(dangerZoneStudents);
        }
      } catch (error) {
        console.log('Send danger zone notification error', error);
      }
    } catch (error) {
      await t.rollback();
      console.log(error.message);
      res.status(502).json(error);
    }
  },
};
