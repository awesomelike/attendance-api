import { sign } from 'jsonwebtoken';
import models from '../models';
import findWithPagination, { needsPagination } from '../util/pagination';
import { PLANNED, GOING_ON } from '../constants/classItems';
import { getPlannedLectures, getGivenLectures } from '../util/sql/lecturesReport';
import makeOptions from '../util/queryOptions';

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

function find(where, res, next) {
  Professor.findAll({
    where,
    include,
  })
    .then((items) => next(items))
    .catch((error) => res.status(502).json(error));
}

function insertDefaultRecords(classItemId, students) {
  const recordsData = students.map(({ id }) => ({
    classItemId,
    studentId: id,
    isAttended: 0,
    isAdditional: 0,
  }));
  return new Promise((resolve, reject) => {
    models.Record.bulkCreate(recordsData)
      .then(() => {
        models.ClassItem.findByPk(classItemId, {
          include: [{
            model: models.Record,
            as: 'records',
            include: [
              {
                model: models.Student,
                as: 'student',
              },
            ],
          }],
        })
          .then(({ records }) => resolve(records))
          .catch((error) => { throw new Error(error); });
      })
      .catch((error) => reject(error));
  });
}

export default {
  getAll(req, res) {
    if (needsPagination(req)) {
      findWithPagination(Professor, include, {
        page: parseInt(req.query.page, 10),
        size: parseInt(req.query.size, 10),
      }, null, res, (professors) => res.status(200).json(professors));
    } else find(null, res, (professors) => res.status(200).json(professors));
  },
  get(req, res) {
    Professor.findByPk(req.params.id, { include })
      .then((professor) => res.status(200).json(professor));
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
    const { currentClassItem, currentSection } = req.classAndSection;
    try {
      let insertedRecords = null;
      if (currentClassItem.classItemStatusId === PLANNED
          && currentClassItem.records.length === 0) {
        insertedRecords = await insertDefaultRecords(
          currentClassItem.id,
          currentSection.students,
        );
        await currentClassItem.update({ classItemStatusId: GOING_ON, date: Date.now() });
        await models.Student.update({
          inClass: true,
        }, {
          where: { id: currentSection.students.map(({ id }) => id) },
        });
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
      res.status(200).json({ records });
      next();
    } catch (error) {
      console.log(error);
      res.status(502).json(error);
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
    const planned = await getPlannedLectures();
    const given = await getGivenLectures();
    const result = [];
    planned.forEach(({
      // eslint-disable-next-line no-shadow
      id, Professor, Course, Planned,
    }) => {
      const associatedGiven = given.find((givenObject) => givenObject.id === id);
      result.push({
        Professor,
        Course,
        Planned,
        Given: associatedGiven ? associatedGiven.Given : 0,
      });
    });
    if (req.query.format === 'excel') return res.xls('LecturesReport.xlsx', result);
    res.status(200).json(result);
  },
  async getMakeups(req, res) {
    Professor.findByPk(req.params.id, { include: [{ model: models.Makeup, as: 'makeups' }] })
      .then((result) => res.status(200).json(result.makeups))
      .catch((error) => res.status(502).json(error));
  },
};
