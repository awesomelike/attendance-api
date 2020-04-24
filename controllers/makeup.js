import models from '../models';
// import { NOT_SEEN, ACCEPTED, REJECTED } from '../constants/makeups';

const { Makeup } = models;

export const options = {
  include: [
    {
      model: models.Account,
      as: 'resolvedBy',
      attributes: ['id', 'name', 'email'],
    },
    {
      model: models.MakeupStatus,
      as: 'makeupStatus',
      attributes: ['id', 'name'],
    },
    {
      model: models.Room,
      as: 'room',
    },
    {
      model: models.TimeSlot,
      as: 'timeSlots',
      through: {
        attributes: [],
      },
    },
    {
      model: models.ClassItem,
      as: 'classItem',
      include: [
        {
          model: models.Class,
          as: 'class',
          include: [
            {
              model: models.WeekDay,
              as: 'weekDay',
            },
            {
              model: models.Room,
              as: 'room',
            },
            {
              model: models.TimeSlot,
              as: 'timeSlots',
              through: {
                attributes: [],
              },
            },
            {
              model: models.Section,
              as: 'section',
              include: [
                {
                  model: models.Professor,
                  as: 'professor',
                },
                {
                  model: models.Course,
                  as: 'course',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const isAlreadyResolved = (makeupId) => new Promise((resolve, reject) => {
  models.Makeup.findByPk(makeupId)
    .then((makeup) => resolve(makeup.resolvedById !== null))
    .catch((error) => reject(error));
});

export default {
  getAll(req, res) {
    const getAllOptions = req.query.makeupStatusId
      ? {
        ...options,
        where: {
          makeupStatusId: parseInt(req.query.makeupStatusId, 10),
        },
      } : options;
    Makeup.findAll(getAllOptions)
      .then((makeups) => res.status(200).json(makeups))
      .catch((error) => res.status(502).json(error));
  },
  get(req, res) {
    Makeup.findByPk(req.params.id, options)
      .then((makeup) => res.status(200).json(makeup))
      .catch((error) => res.status(502).json(error));
  },
  async create(req, res) {
    try {
      const makeup = await Makeup.create({
        professorId: req.account.professorId,
        classItemId: req.makeup.classItemId,
        newDate: req.makeup.newDate,
        roomId: req.makeup.roomId,
      });
      await makeup.setTimeSlots(req.makeup.timeSlots);
      const result = await Makeup.findByPk(makeup.id, options);
      res.io.emit('newMakeup', result);
      res.status(200).json(makeup);
    } catch (error) {
      res.status(502).json(error);
    }
  },
  update(req, res) {
    Makeup.update(req.makeup, { where: { id: req.params.id } })
      .then(() => res.sendStatus(200))
      .catch((error) => res.status(502).json(error));
  },
  async resolve(req, res) {
    if (await isAlreadyResolved(req.params.id)) {
      return res.status(403).json({ error: 'This makeup is already resolved' });
    }
    Makeup.update({
      makeupStatusId: req.makeup.makeupStatusId,
      resolvedAt: (new Date()).getTime(),
      resolvedById: req.account.id,
    }, { where: { id: req.params.id } })
      .then(() => res.sendStatus(200))
      .catch((error) => res.status(502).json(error));
  },
};
