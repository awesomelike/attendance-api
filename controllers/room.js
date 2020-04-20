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
              through: {
                attributes: [],
              },
            },
          ],
        },
      ],
    })
      .then((rooms) => {
        const availableRooms = rooms.filter((room) => {
          const { classes } = room;
          for (let i = 0; i < classes.length; i += 1) {
            const { classItems } = classes[i];
            if (classItems.filter((classItem) => moment(classItem.plannedDate).startOf('day') === date).length > 0) {
              if (timeSlots
                .filter((timeSlot) => classes[i].timeSlots.map(({ id }) => id)
                  .includes(timeSlot)).length > 0) { return false; }
            }
          }
          return true;
        });
        resolve(availableRooms.map(({ id, label }) => ({ id, label })));
      })
      .catch((error) => reject(error));
  });
}

export default {
  async getAll(req, res) {
    if (req.query.date && req.query.timeSlots) {
      const date = moment(parseInt(req.query.date, 10)).startOf('day');
      const timeSlots = JSON.parse(req.query.timeSlots);
      const availableRooms = await getAvailableRooms(date, timeSlots);
      console.log(availableRooms.length);
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
