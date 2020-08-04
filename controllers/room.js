import moment from 'moment';
import models from '../models';
import { ACCEPTED } from '../constants/makeups';

const { Room } = models;

export function getAvailableRooms(date, timeSlots) {
  const isSameDay = (p) => moment(p).startOf('day').valueOf() === date;
  return new Promise((resolve, reject) => {
    Room.findAll({
      attributes: ['id', 'label'],
      include: [
        {
          model: models.Class,
          as: 'classes',
          attributes: ['id', 'roomId'],
          include: [
            {
              model: models.ClassItem,
              as: 'classItems',
              attributes: ['id', 'classId', 'plannedDate'],
            },
            {
              model: models.TimeSlot,
              as: 'timeSlots',
              through: { attributes: [] },
            },
          ],
        },
      ],
    })
      .then(async (rooms) => {
        console.log('rooms.length', rooms.length);
        let availableRooms = rooms.filter((room) => {
          const { classes: c } = room;
          for (let i = 0; i < c.length; i += 1) {
            const { classItems: ci } = c[i];
            // First check if there are planned classes on this day
            if (ci.filter(({ plannedDate: p }) => isSameDay(p)).length > 0) {
              // If there exist classes on the same day, then look for free timeslots
              if (timeSlots
                .filter((timeSlot) => c[i].timeSlots.map(({ id }) => id)
                  .includes(timeSlot)).length > 0) { return false; }
            }
          }
          return true;
        });
        const makeups = await models.Makeup.findAll({
          where: {
            newDate: date,
            makeupStatusId: ACCEPTED,
          },
          include: [
            {
              model: models.Room,
              as: 'room',
            },
            {
              model: models.TimeSlot,
              as: 'timeSlots',
              through: { attributes: [] },
            },
          ],
        });
        availableRooms = availableRooms.filter((room) => {
          for (let i = 0; i < makeups.length; i += 1) {
            const isTimeSlotOk = timeSlots
              .filter((timeSlot) => makeups[i]
                .timeSlots.map(({ id }) => id)
                .includes(timeSlot))
              .length > 0;
            if (makeups[i].roomId === room.id && isTimeSlotOk) {
              return false;
            }
          }
          return true;
        });
        const result = availableRooms.map(({ id, label }) => ({ id, label }));
        resolve(result);
      })
      .catch((error) => reject(error));
  });
}

export default {
  async getAll(req, res) {
    try {
      if (req.query.date && req.query.timeSlots) {
        const date = moment(parseInt(req.query.date, 10)).startOf('day').valueOf();
        const timeSlots = JSON.parse(req.query.timeSlots);
        const availableRooms = await getAvailableRooms(date, timeSlots);
        console.log('available.length', availableRooms.length);
        res.status(200).json(availableRooms);
      } else {
        const allRooms = await Room.findAll({
          attributes: ['id', 'label'],
          order: [['label', 'ASC']],
        });
        res.status(200).json(allRooms);
      }
    } catch (error) {
      res.status(502).json(error.message);
    }
  },
};
