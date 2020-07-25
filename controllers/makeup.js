import models from '../models';
// import { NOT_SEEN, ACCEPTED, REJECTED } from '../constants/makeups';
import { getAvailableRooms } from './room';

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
  async create(req, res, next) {
    try {
      const makeup = await Makeup.create({
        professorId: req.account.professorId,
        classItemId: req.makeup.classItemId,
        newDate: req.makeup.newDate,
        roomId: req.makeup.roomId,
      });
      await makeup.setTimeSlots(req.makeup.timeSlots);
      const result = await Makeup.findByPk(makeup.id, options);
      req.event = { name: 'newMakeup', data: result };
      next();
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
    try {
      if (await isAlreadyResolved(req.params.id)) {
        return res.status(403).json({ error: 'This makeup is already resolved' });
      }
      const { newDate, timeSlots, roomId } = req.makeup;
      const availableRooms = await getAvailableRooms(newDate, timeSlots);
      if (!availableRooms.map(({ id }) => id).includes(roomId)) {
        return res.status(403).json({ error: 'This room is already reserved!' });
      }
      await Makeup.update({
        makeupStatusId: req.makeup.makeupStatusId,
        resolvedAt: Date.now(),
        resolvedById: req.account.id,
      }, { where: { id: req.params.id } });
      res.sendStatus(200);
    } catch (error) {
      res.status(502).json(error);
    }
  },
};
