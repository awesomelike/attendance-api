import models, { sequelize } from '../models';
import { getAvailableRooms } from './room';
import { ACCEPTED } from '../constants/makeups';
import { getCurrentSemester } from './semester';
import time from '../util/time';

const { Makeup } = models;

export const options = {
  order: [['id', 'DESC']],
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
      through: { attributes: [] },
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
              through: { attributes: [] },
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

const isAlreadyResolved = async (makeupId) => {
  const makeup = await models.Makeup.findByPk(makeupId);
  return makeup.resolvedById !== null;
};

export default {
  async getAll(req, res) {
    try {
      const getAllOptions = req.query.makeupStatusId
        ? {
          ...options,
          where: { makeupStatusId: parseInt(req.query.makeupStatusId, 10) },
        } : options;
      const makeups = await Makeup.findAll(getAllOptions);
      for (let i = 0; i < makeups.length; i += 1) {
        const { dataValues } = makeups[i];
        // eslint-disable-next-line no-await-in-loop
        dataValues.week = await time.getCurrentWeek(dataValues.newDate);
      }

      res.status(200).json(makeups);
    } catch (error) {
      res.status(502).json(error.message);
    }
  },
  async get(req, res) {
    try {
      const makeup = await Makeup.findByPk(req.params.id, options);
      res.status(200).json(makeup);
    } catch (error) {
      res.status(502).json(error);
    }
  },
  async create(req, res, next) {
    let t;
    try {
      const semester = await getCurrentSemester();
      if (!semester) return res.status(403).json({ error: 'No ongoing semester right now!' });
      const { id: semesterId } = semester;

      t = await sequelize.transaction();

      const makeup = await Makeup.create({
        professorId: req.account.professorId,
        classItemId: req.makeup.classItemId,
        newDate: req.makeup.newDate,
        roomId: req.makeup.roomId,
        semesterId,
      }, {
        transaction: t,
      });
      await makeup.setTimeSlots(req.makeup.timeSlots, { transaction: t });

      await t.commit();

      const result = await Makeup.findByPk(makeup.id, options);
      req.event = { name: 'newMakeup', data: result };
      next();
      res.status(200).json(makeup);
    } catch (error) {
      await t.rollback();
      console.log(error);
      res.status(502).json(error);
    }
  },
  async update(req, res) {
    try {
      await Makeup.update(req.makeup, { where: { id: req.params.id } });
      res.sendStatus(200);
    } catch (error) {
      res.status(502).json(error);
    }
  },
  async resolve(req, res) {
    try {
      if (await isAlreadyResolved(req.params.id)) {
        return res.status(403).json({ error: 'This makeup is already resolved' });
      }
      const { newDate, timeSlots, roomId } = req.makeup;
      if (req.makeup.makeupStatusId === ACCEPTED) {
        const availableRooms = await getAvailableRooms(newDate, timeSlots);
        if (!availableRooms.map(({ id }) => id).includes(roomId)) {
          return res.status(403).json({ error: 'This room is already reserved!' });
        }
      }
      const semester = await getCurrentSemester();
      await Makeup.update({
        makeupStatusId: req.makeup.makeupStatusId,
        resolvedAt: Date.now(),
        resolvedById: req.account.id,
        semesterId: semester.id,
      }, { where: { id: req.params.id } });
      res.sendStatus(200);
    } catch (error) {
      console.log(error);
      res.status(502).json(error);
    }
  },
};
