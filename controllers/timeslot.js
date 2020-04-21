import models from '../models';

const { TimeSlot } = models;

const find = (where, res, next) => {
  TimeSlot.findAll({
    where,
    include: [
      {
        model: models.Class,
        as: 'classes',
        through: {
          attributes: [],
        },
        include: [
          {
            model: models.Section,
            as: 'section',
          },
        ],
      },
    ],
  })
    .then((timeslots) => next(timeslots))
    .catch((error) => res.status(502).json(error));
};

export default {
  getAll(req, res) {
    if (req.query.raw) {
      TimeSlot.findAll()
        .then((timeSlots) => res.status(200).json(timeSlots))
        .catch((error) => res.status(502).json(error));
    } else {
      find(null, res, (timeslots) => res.status(200).json(timeslots));
    }
  },
  get(req, res) {
    TimeSlot.findByPk(req.params.id)
      .then((timeslot) => res.status(200).json(timeslot))
      .catch((error) => res.status(502).json(error));
  },

};
