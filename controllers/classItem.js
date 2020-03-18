import models from '../models';
import findWithPagination, { needsPagination } from '../util/pagination';

const { ClassItem } = models;

const include = [
  {
    model: models.Record,
    as: 'records',
    include: [
      {
        model: models.Student,
        as: 'student',
      },
    ],
  },
];

function find(where, res, next) {
  ClassItem.findAll({
    where,
    include,
  })
    .then((classItems) => next(classItems))
    .catch((error) => res.status(502).json(error));
}

export default {
  getAll(req, res) {
    if (needsPagination(req)) {
      findWithPagination(ClassItem, include, {
        page: Number(req.query.page),
        size: Number(req.query.size),
      }, null, res, (classItems) => res.status(200).json(classItems));
    } else find(null, res, (classItems) => res.status(200).json(classItems));
  },
  async get(req, res) {
    try {
      const classItemWithRecords = await ClassItem.findByPk(req.params.id, {
        include,
      }, {
        raw: true,
      });
      if (classItemWithRecords) res.status(200).json(classItemWithRecords);
      else res.sendStatus(404);
    } catch (error) {
      res.status(502).json(error);
    }
  },
};
