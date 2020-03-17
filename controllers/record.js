import models from '../models';
import findWithPagination from '../util/pagination';

const { Record } = models;

const include = [
  {
    model: models.ClassItem,
    as: 'classItem',
    include: [
      {
        model: models.Class,
        as: 'class',
        include: [
          {
            model: models.Section,
            as: 'section',
            include: [
              {
                model: models.Professor,
                as: 'professor',
              },
              {
                model: models.Course,
                as: 'course',
              },
            ],
          },
        ],
      },
    ],
  },
];

function find(where, res, next) {
  Record.findAll({
    where,
    include,
  })
    .then((items) => res.status(200).json(items))
    .catch((error) => res.status(502).json(error));
}

export default {
  getAll(req, res) {
    if (Object.keys(req.query).indexOf('page') > -1
        && Object.keys(req.query).indexOf('size') > -1) {
      findWithPagination(Record, include, {
        page: Number(req.query.page),
        size: Number(req.query.size),
      }, null, res, (records) => res.status(200).json(records));
    }
  },
};
