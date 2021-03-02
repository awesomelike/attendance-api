import { sign } from 'jsonwebtoken';
import models, { sequelize } from '../models';
import { PLANNED, GOING_ON } from '../constants/classItems';
import { getPlannedLectures, getGivenLectures } from '../util/sql/lecturesReport';
import makeOptions from '../util/queryOptions';
import { getCurrentSemester } from './semester';

const { Professor } = models;

require('dotenv').config();

const include = [{
  model: models.Section,
  as: 'sections',
  include: [
    {
      model: models.Course,
      as: 'course',
    },
    {
      model: models.Class,
      as: 'classes',
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      include: [
        {
          model: models.ClassItem,
          as: 'classItems',
          attributes: { exclude: ['createdAt', 'updatedAt'] },
        },
      ],
    },
  ],
}];

async function insertDefaultRecords(classItemId, students) {
  const semester = await getCurrentSemester();
  if (!semester) throw new Error('No ongoing semester right now!');
  const { id: semesterId } = semester;

  const recordsData = students.map(({ id }) => ({
    classItemId,
    studentId: id,
    isAttended: 0,
    isAdditional: 0,
    semesterId,
  }));

  await models.Record.bulkCreate(recordsData);

  const { records } = await models.ClassItem.findByPk(classItemId, {
    include: [
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
    ],
  });
  return records;
}

export default {
  async getAll(req, res) {
    try {
      const unassinged = req.query.unassigned;
      const options = makeOptions(req, {
        include: unassinged ? [] : include,
        where: unassinged ? { accountId: null } : {},
        ignoreProps: ['unassigned'],
      });
      const professors = await Professor.findAll(options);
      res.status(200).json(professors);
    } catch (error) {
      console.log(error);
      res.status(502).json(error.message);
    }
  },
  async get(req, res) {
    try {
      const professor = await Professor.findByPk(req.params.id, { include });
      res.status(200).json(professor);
    } catch (error) {
      console.log(error);
      res.status(502).json(error.message);
    }
  },
  async getSections(req, res) {
    const options = makeOptions(req, { include: [{ model: models.Course, as: 'course' }] });
    try {
      const professor = await Professor.findByPk(req.params.id);
      const sections = await professor.getSections(options);
      if (sections) res.status(200).json(sections);
      else res.sendStatus(404);
    } catch (error) {
      res.status(502).json(error);
    }
  },
  async getCurrentClass(req, res) {
    const {
      currentClassItem, currentSection, professor, courseSections,
    } = req.classAndSection;
    sign({ professorRfid: professor.rfid }, process.env.JWT_KEY, { expiresIn: '3h' },
      (tokenError, token) => {
        if (tokenError) return res.status(502).json({ error: tokenError });
        res.status(200).json({
          token,
          professorUid: professor.uid,
          professorName: professor.name,
          professorRfid: professor.rfid,
          courseId: currentSection.course.id,
          courseName: currentSection.course.name,
          sectionId: currentSection.id,
          sectionNumber: currentSection.sectionNumber,
          auditory: currentSection.students.length,
          classItem: currentClassItem,
          courseSections,
        });
      });
  },
  async startAttendance(req, res, next) {
    const { currentClassItem, currentSection, classNow: { roomId } } = req.classAndSection;
    let t;
    try {
      let insertedRecords = null;
      if (currentClassItem.classItemStatusId === PLANNED
          && currentClassItem.records.length === 0) {
        insertedRecords = await insertDefaultRecords(
          currentClassItem.id,
          currentSection.students,
        );

        t = await sequelize.transaction();

        await currentClassItem.update({
          actualRoomId: roomId,
          classItemStatusId: GOING_ON,
          date: Date.now(),
        }, {
          transaction: t,
        });
        await models.Student.update({ inClass: true }, {
          where: { id: currentSection.students.map(({ id }) => id) },
          transaction: t,
        });

        await t.commit();
      }

      let records = insertedRecords || currentClassItem.records;
      records = await models.Record.findAll({
        where: { id: records.map(({ id }) => id) },
        include: [
          {
            model: models.Student,
            as: 'student',
          },
        ],
      });

      res.status(200).json({ records, classItemStatusId: GOING_ON });
      next();
    } catch (error) {
      if (t) await t.rollback();

      console.log(error);
      res.status(502).json(error.message);
    }
  },
  async getByRfid(req, res) {
    try {
      const { rfid } = req.params;
      const professor = await Professor.findOne({ where: { rfid } });
      res.status(200).json(professor);
    } catch (error) {
      res.status(502).json(error);
    }
  },
  async getLecturesReport(req, res) {
    const { semesterId } = req;

    const planned = await getPlannedLectures(semesterId);
    const given = await getGivenLectures(semesterId);

    const result = [];
    planned.forEach(({
      // eslint-disable-next-line no-shadow
      id, Professor, Course, Planned,
    }) => {
      const associatedGiven = given.find((givenObject) => givenObject.id === id
        && givenObject.Course === Course);
      result.push({
        Professor,
        Course,
        Planned,
        Given: associatedGiven ? associatedGiven.Given : 0,
      });
    });
    if (req.query.format === 'excel') return res.xls('LecturesReport.xlsx', result);
    console.log(result);
    res.status(200).json(result);
  },
  async getMakeups(req, res) {
    try {
      const result = await Professor.findByPk(req.params.id, { include: [{ model: models.Makeup, as: 'makeups' }] });
      res.status(200).json((result && result.makeups) || []);
    } catch (error) {
      console.log(error);
      res.status(502).json(error);
    }
  },
};
