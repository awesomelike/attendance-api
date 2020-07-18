import models from '../models';
import time from '../util/time';
import findWithPagination, { needsPagination } from '../util/pagination';
import { PLANNED, GOING_ON } from '../constants/classItems';
import { getPlannedLectures, getGivenLectures } from '../util/sql/lecturesReport';

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

const getProfessorByRfid = (rfid) => Professor.findOne({ where: { rfid }, include });

async function getCurrentClassAndSection(rfid, res, callback) {
  try {
    const professor = await getProfessorByRfid(rfid);
    if (!professor) return res.status(404).json({ error: 'No such professor!' });

    const timeSlotId = time.getCurrentTimeSlotId();
    if (!timeSlotId) return res.status(404).json({ error: 'You have no classes right now!' });

    const timeSlot = await models.TimeSlot.findByPk(timeSlotId);
    const professorSections = await professor.getSections();
    const currentClasses = await timeSlot.getClasses({
      where: {
        weekDayId: (new Date(2020, 2, 30, 10, 35, 0)).getDay(),
      },
    });

    if (!currentClasses.length) return res.status(404).json({ error: 'No classes today!' });

    const classNow = currentClasses
      .find((currentClass) => professorSections.map((section) => section.id)
        .includes(currentClass.sectionId));
    const [currentClassItem] = await classNow.getClassItems({
      where: {
        week: await time.getCurrentWeek(),
      },
      include: [
        {
          model: models.Class,
          as: 'class',
          include: [
            {
              model: models.TimeSlot,
              as: 'timeSlots',
              through: { attributes: [] },
            },
            {
              model: models.Room,
              as: 'room',
              attributes: ['id', 'label'],
            },
          ],
        },
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
        {
          model: models.ClassItemStatus,
          as: 'status',
        },
      ],
    });
    const currentSection = await classNow.getSection({
      include: [
        {
          model: models.Student,
          as: 'students',
          through: { attributes: [] },
        },
        {
          model: models.Course,
          as: 'course',
          attributes: ['id', 'name'],
        },
      ],
    });
    callback(null, { currentClassItem, currentSection, professor });
  } catch (error) {
    callback(error, { currentClassItem: null, currentSection: null, professor: null });
  }
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
    try {
      const professor = await Professor.findByPk(req.params.id);
      const sections = await professor.getSections({ include: [{ model: models.Course, as: 'course' }] });
      if (sections) res.status(200).json(sections);
      else res.sendStatus(404);
    } catch (error) {
      res.status(502).json(error);
    }
  },
  async getCurrentClass(req, res) {
    getCurrentClassAndSection(req.params.rfid, res, (error, {
      currentClassItem,
      currentSection,
      professor,
    }) => {
      if (error) return res.status(502).json(error);
      res.status(200).json({
        professorUid: professor.uid,
        professorName: professor.name,
        professorRfid: professor.rfid,
        courseId: currentSection.course.id,
        courseName: currentSection.course.name,
        sectionId: currentSection.id,
        sectionNumber: currentSection.sectionNumber,
        auditory: currentSection.students.length,
        classItem: currentClassItem,
      });
    });
  },
  async startAttendance(req, res) {
    const { rfid } = req;
    console.log(req.body);
    getCurrentClassAndSection(rfid, res, async (error, {
      currentClassItem,
      currentSection,
      professor,
    }) => {
      if (error) return res.status(502).json(error);
      try {
        let insertedRecords;
        if (currentClassItem.classItemStatusId === PLANNED
          && currentClassItem.records.length === 0) {
          insertedRecords = await insertDefaultRecords(
            currentClassItem.id,
            currentSection.students,
          );
          currentClassItem.update({ classItemStatusId: GOING_ON, date: +new Date() });
        }
        res.status(200).json({
          // professorUid: professor.uid,
          // professorName: professor.name,
          // courseId: currentSection.course.id,
          // courseName: currentSection.course.name,
          // sectionId: currentSection.id,
          // sectionNumber: currentSection.sectionNumber,
          // auditory: currentSection.students.length,
          // classItem: currentClassItem,
          records: insertedRecords ? insertedRecords.map((record) => ({
            ...record,
            student: currentSection.students.find((s) => s.id === record.studentId),
          })) : currentClassItem.records,
        });
      // eslint-disable-next-line no-shadow
      } catch (error) {
        console.log(error);
        res.status(502).json(error);
      }
    });
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
