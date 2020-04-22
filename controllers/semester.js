import models from '../models';

const { Semester } = models;

const find = (where, include, res, next) => {
  Semester.findAll({
    where,
    include,
  })
    .then((semesters) => next(semesters))
    .catch((error) => res.status(502).json(error));
};

export default {
  getAll(req, res) {
    if (req.query.raw) {
      return find(null, null, res, (semesters) => res.status(200).json(semesters));
    }
    find(null, [
      {
        model: models.Section,
        as: 'sections',
        include: [
          {
            model: models.Course,
            as: 'course',
          }, {
            model: models.Professor,
            as: 'professor',
            attributes: ['id', 'name', 'uid'],
          },
        ],
      },
    ], res, (semesters) => res.status(200).json(semesters));
  },
  get(req, res) {
    Semester.findByPk(req.params.id)
      .then((semester) => res.status(200).json(semester))
      .catch((error) => res.status(502).json(error));
  },
  create(req, res) {
    Semester.create(req.semester)
      .then((semester) => res.status(200).json(semester))
      .catch((error) => res.status(502).json(error));
  },
};
