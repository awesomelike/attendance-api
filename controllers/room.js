import moment from 'moment';
import models from '../models';

const { Room } = models;

export function getAvailableRooms(date, timeSlots) {
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
      .then((rooms) => {
        console.log('rooms.length', rooms.length);
        const availableRooms = rooms.filter((room) => {
          const { classes: c } = room;
          for (let i = 0; i < c.length; i += 1) {
            const { classItems: ci } = c[i];
            // First check if there are planned classes on this day
            if (ci.filter(({ plannedDate: p }) => moment(p).startOf('day').valueOf() === date).length > 0) {
              // If there exist classes on the same day, then look for free timeslots
              if (timeSlots
                .filter((timeSlot) => c[i].timeSlots.map(({ id }) => id)
                  .includes(timeSlot)).length > 0) { return false; }
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
    if (req.query.date && req.query.timeSlots) {
      const date = moment(parseInt(req.query.date, 10)).startOf('day').valueOf();
      const timeSlots = JSON.parse(req.query.timeSlots);
      const availableRooms = await getAvailableRooms(date, timeSlots);
      console.log('available.length', availableRooms.length);
      res.status(200).json(availableRooms);
    } else {
      Room.findAll({
        attributes: ['id', 'label'],
      })
        .then((rooms) => res.status(200).json(rooms))
        .catch((error) => res.status(502).json(error));
    }
  },
};
