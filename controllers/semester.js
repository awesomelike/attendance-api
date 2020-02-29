import models from '../models';

const { Semester } = models;

const find = (where, res, next) => {
  Semester.findAll({
    where,
    include: [
      {
        model: models.Section,
        as: 'section',
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
    ],
  })
    .then((semesters) => next(semesters))
    .catch((error) => res.status(502).json(error));
};

export default {
  getAll(req, res) {
    find(null, res, (semesters) => { res.status(200).json(semesters); });
  },
  get(req, res) {
    Semester.findByPk(req.params.id)
      .then((semester) => res.status(200).json(semester))
      .catch((error) => res.status(502).json(error));
  },
};
