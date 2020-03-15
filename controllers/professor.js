import models from '../models';
import time from '../util/time';

const { Professor } = models;

const include = [{
  model: models.Section,
  as: 'sections',
  include: [
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
    find(null, res, (professors) => res.status(200).json(professors));
  },
  get(req, res) {
    Professor.findByPk(req.params.id, { include })
      .then((professor) => res.status(200).json(professor));
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
        weekDayId: (new Date(2020, 2, 13, 10, 35, 0)).getDay(),
      },
    }));

    if (!currentClasses.length) return res.status(404).json({ error: 'No classes today!' });

    const classNow = currentClasses
      .find((currentClass) => professorSections.map((section) => section.id)
        .includes(currentClass.sectionId));
    const [currentClassItem] = await classNow.getClassItems({
      where: { week: await time.getCurrentWeek() },
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
      ],
    });
    try {
      const records = await insertDefaultRecords(currentClassItem.id, currentSection.students);
      res.status(200).json({
        sectionId: currentSection.id,
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
};
