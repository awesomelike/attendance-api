import models from '../models';
import time from '../util/time';
import findWithPagination, { needsPagination } from '../util/pagination';
import { PLANNED, GOING_ON } from '../constants/classItems';
import { getPlannedLectures, getGivenLectures } from '../util/sql/lecturesReport';
import { isTaughtBy } from './classItem';

const { Professor } = models;

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
  const records = [];
  for (let i = 0; i < students.length; i += 1) {
    records.push({
      classItemId,
      studentId: students[i].id,
      isAttended: 0,
      isAdditional: 0,
    });
  }
  return new Promise((resolve, reject) => {
    models.Record.bulkCreate(records, { returning: true })
      .then((results) => resolve(results))
      .catch((error) => reject(error));
  });
}

export default {
  getAll(req, res) {
    if (needsPagination(req)) {
      findWithPagination(Professor, include, {
        page: Number(req.query.page),
        size: Number(req.query.size),
      }, null, res, (professors) => res.status(200).json(professors));
    } else find(null, res, (professors) => res.status(200).json(professors));
  },
  get(req, res) {
    Professor.findByPk(req.params.id, { include })
      .then((professor) => res.status(200).json(professor));
  },
  async getSections(req, res) {
    try {
      const professor = await Professor.findByPk(req.params.id);
      const sections = await professor.getSections({ include: [{ model: models.Course, as: 'course' }] });
      if (sections) res.status(200).json(sections);
      else res.sendStatus(404);
    } catch (error) {
      res.status(502).json(error);
    }
  },
  async handleRfid(req, res) {
    const { rfid } = req;

    const professor = await Professor.findOne({ where: { rfid }, include });
    if (!professor) return res.status(404).json({ error: 'No such professor!' });

    const timeSlotId = time.getCurrentTimeSlotId();
    if (!timeSlotId) return res.status(404).json({ error: 'You have no classes right now!' });

    const timeSlot = await models.TimeSlot.findByPk(timeSlotId);
    const professorSections = (await professor.getSections());
    const currentClasses = (await timeSlot.getClasses({
      where: {
        weekDayId: (new Date(2020, 2, 30, 10, 35, 0)).getDay(),
      },
    }));

    if (!currentClasses.length) return res.status(404).json({ error: 'No classes today!' });

    const classNow = currentClasses
      .find((currentClass) => professorSections.map((section) => section.id)
        .includes(currentClass.sectionId));
    const [currentClassItem] = await classNow.getClassItems({
      where: {
        week: await time.getCurrentWeek(),
        classItemStatusId: PLANNED,
      },
    });
    const currentSection = await classNow.getSection({
      include: [
        {
          model: models.Student,
          as: 'students',
          through: {
            attributes: [],
          },
        },
        {
          model: models.Course,
          as: 'course',
          attributes: ['id', 'name'],
        },
      ],
    });
    try {
      const records = await insertDefaultRecords(currentClassItem.id, currentSection.students);
      currentClassItem.update({ classItemStatusId: GOING_ON });
      res.status(200).json({
        courseId: currentSection.course.id,
        courseName: currentSection.course.name,
        sectionId: currentSection.id,
        sectionNumber: currentSection.sectionNumber,
        classItem: currentClassItem,
        records,
      });
    } catch (error) {
      res.status(502).json(error);
    }
  },
  getByRfid(req, res) {
    const { rfid } = req.params;
    Professor.findOne({ where: { rfid } })
      .then((professor) => res.status(200).json(professor));
  },
  async getLecturesReport(req, res) {
    const planned = await getPlannedLectures();
    const given = await getGivenLectures();
    const result = [];
    planned.forEach(({
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
    try {
      const makeups = await models.Makeup.findAll({ raw: true });
      const filteredMakeups = makeups.filter((makeup) => isTaughtBy(makeup.classItemId, req.params.id));
      res.status(200).json(filteredMakeups);
    } catch (error) {
      res.status(502).json(error);
    }
  },
};
