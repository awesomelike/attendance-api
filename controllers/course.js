import models from '../models';

const { Course } = models;

const include = [
  {
    model: models.Section,
    as: 'sections',
  },
];

function find(where, res, next) {
  Course.findAll({
    where,
    include,
  })
    .then((courses) => next(courses))
    .catch((error) => res.status(502).json(error));
}

export default {
  getAll(_, res) {
    find(null, res, (courses) => res.status(200).json(courses));
  },
  get(req, res) {
    Course.findByPk(req.params.id, { include })
      .then((course) => res.status(200).json(course))
      .catch((error) => res.status(502).json(error));
  },
};
