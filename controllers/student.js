import { Op } from 'sequelize';
import models from '../models';

const include = [
  {
    model: models.Record,
    as: 'records',
  },
  {
    model: models.Section,
    as: 'sections',
    through: {
      model: models.StudentSection,
      as: 'studentSections',
    },
  },
];

function find(where, res, next) {
  models.Student.findAll({
    where,
    include,
    exclude: ['password'],
  })
    .then((items) => next(items))
    .catch((error) => res.status(502).json(error));
}

function findWithPagination({ page = 1, size = Number.MAX_SAFE_INTEGER }, where, res, next) {
  const limit = size;
  const offset = (page - 1) * size;
  models.Student.findAll({
    where,
    include,
    limit,
    offset,
    exclude: ['password'],
    subQuery: false,
  })
    .then((students) => next(students))
    .catch((error) => res.status(502).json(error));
}

export default {
  getAll(req, res) {
    if (Object.keys(req.query).indexOf('page') > -1
        && Object.keys(req.query).indexOf('size') > -1) {
      findWithPagination({
        page: Number(req.query.page),
        size: Number(req.query.size),
      }, null, res, (students) => res.status(200).json(students));
    } else {
      find(null, res, (students) => res.status(200).json(students));
    }
  },
  get(req, res) {
    models.Student.findByPk(req.params.id, { include })
      .then((student) => res.status(200).json(student))
      .catch((error) => res.status(502).json(error));
  },
  async getSome(req, res) {
    const where = {};
    if (Object.keys(req.query).length > 0) {
      Object.keys(req.query).forEach((key) => {
        if (key !== 'page' && key !== 'size') {
          where[key] = {
            [Op.like]: `%${req.query[key]}%`,
          };
        }
      });
      if (Object.keys(req.query).indexOf('page') > -1
      && Object.keys(req.query).indexOf('size') > -1) {
        findWithPagination({
          page: Number(req.query.page),
          size: Number(req.query.size),
        }, where, res, (students) => {
          res.status(200).json(students);
        });
      } else res.status(200).json(await models.Student.findAll({ where }));
    } else res.status(400).json({ message: 'Please provide some search filters' });
  },
};
