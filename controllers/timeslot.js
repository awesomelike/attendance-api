import models from '../models';

const { TimeSlot } = models;

const include = [
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
];

export default {
  async getAll(req, res) {
    try {
      const options = { include };
      if (req.query.raw) {
        delete options.include;
      }
      const timeSlots = await TimeSlot.findAll(options);
      res.status(200).json(timeSlots);
    } catch (error) {
      console.log(error);
      res.status(502).json(error);
    }
  },
  async get(req, res) {
    try {
      const timeslot = await TimeSlot.findByPk(req.params.id);
      res.status(200).json(timeslot);
    } catch (error) {
      console.log(error);
      res.status(502).json(error);
    }
  },
};
