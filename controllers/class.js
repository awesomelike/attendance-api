import models from '../models';
import findWithPagination, { needsPagination } from '../util/pagination';

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

function find(where, res, next) {
  Class.findAll({
    where,
    include,
  })
    .then((classes) => next(classes))
    .catch((error) => res.status(502).json(error));
}

export default {
  getAll(req, res) {
    if (needsPagination(req)) {
      findWithPagination(Class, include, {
        page: Number(req.query.page),
        size: Number(req.query.size),
      }, null, res, (classes) => res.status(200).json(classes));
    } else find(null, res, (classes) => res.status(200).json(classes));
  },
  get(req, res) {
    Class.findByPk(req.params.id)
      .then((dbClass) => res.status(200).json(dbClass))
      .catch((error) => res.status(502).json(error));
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
