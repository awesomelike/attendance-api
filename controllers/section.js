import models from '../models';
import makeOptions from '../util/queryOptions';

const { Section } = models;

const include = [
  {
    model: models.Professor,
    as: 'professor',
  },
  {
    model: models.Course,
    as: 'course',
  },
];

export default {
  async getAll(req, res) {
    try {
      const sections = await Section.findAll(makeOptions(req, { include }));
      res.status(200).json(sections);
    } catch (error) {
      console.log(error);
      res.status(502).json(error.message);
    }
  },
  async get(req, res) {
    try {
      const section = await Section.findByPk(req.params.id);
      res.status(200).json(section);
    } catch (error) {
      res.status(502).json(error);
    }
  },
  async getClasses(req, res) {
    try {
      const section = await Section.findByPk(req.params.id);
      const classes = await section.getClasses({
        include: [
          {
            model: models.WeekDay,
            as: 'weekDay',
          },
          {
            model: models.TimeSlot,
            as: 'timeSlots',
            through: {
              attributes: [],
            },
          }],
      });
      if (classes.length) res.status(200).json(classes);
      else res.sendStatus(404);
    } catch (error) {
      res.status(502).json(error);
    }
  },
};
