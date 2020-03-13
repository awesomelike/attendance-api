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

export default {
  getAll(req, res) {
    find(null, res, (professors) => res.status(200).json(professors));
  },
  get(req, res) {
    Professor.findByPk(req.params.id, { include })
      .then((professor) => res.status(200).json(professor));
  },
  async handleRfid(req, res) {
    const { rfid } = req.body;
    const timeSlotId = time.getCurrentTimeSlotId();
    if (!timeSlotId) return res.status(404).json({ message: 'You have no classes right now!' });

    const professor = await Professor.findOne({ where: { rfid }, include });
    if (!professor) return res.status(404).json({ message: 'No such professor!' });
    const timeSlot = await models.TimeSlot.findByPk(timeSlotId);
    const professorSections = (await professor.getSections());
    const currentClasses = (await timeSlot.getClasses({
      where: {
        weekDayId: (new Date()).getDay(),
      },
    }));
    const classNow = currentClasses
      .find((currentClass) => professorSections.map((section) => section.id)
        .includes(currentClass.sectionId));
    const [currentClassItem] = await classNow.getClassItems({
      where: { week: await time.getCurrentWeek() },
    });
    res.status(200).json(currentClassItem);
  },
};
