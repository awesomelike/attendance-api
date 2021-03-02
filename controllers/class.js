import models from '../models';
import makeOptions from '../util/queryOptions';

const { Class } = models;

const include = [
  {
    model: models.WeekDay,
    as: 'weekDay',
  },
  {
    model: models.TimeSlot,
    as: 'timeSlots',
    through: { attributes: [] },
  },
  {
    model: models.ClassItem,
    as: 'classItems',
  },
];

export default {
  async getAll(req, res) {
    try {
      const classes = await Class.findAll(makeOptions(req, { include }));
      res.status(200).json(classes);
    } catch (error) {
      console.log(error);
      res.status(502).json(error.message);
    }
  },
  async get(req, res) {
    try {
      const dbClass = await Class.findByPk(req.params.id);
      res.status(200).json(dbClass);
    } catch (error) {
      res.status(502).json(error);
    }
  },
  async getClassItems(req, res) {
    try {
      const classObject = await Class.findByPk(req.params.id);
      const classItems = await classObject.getClassItems();
      if (classItems.length) res.status(200).json(classItems);
      else res.sendStatus(404);
    } catch (error) {
      res.status(502).json(error);
    }
  },
};
