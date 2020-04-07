import models from '../models';

const { Makeup } = models;

const options = {
  include: [
    {
      model: models.MakeupStatus,
      as: 'makeupStatus',
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

export default {
  getAll(_, res) {
    Makeup.findAll(options)
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
  resolve(req, res) {
    Makeup.update({
      resolvedAt: (new Date()).getTime(),
      resolvedById: req.account.id,
    }, { where: { id: req.params.id } })
      .then(() => res.sendStatus(200))
      .catch((error) => res.status(502).json(error));
  },
};