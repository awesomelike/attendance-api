import models from '../models';
import findWithPagination, { needsPagination } from '../util/pagination';

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

function find(where, res, next) {
  Section.findAll({
    where,
    include,
  })
    .then((sections) => next(sections))
    .catch((error) => res.status(502).json(error));
}

export default {
  getAll(req, res) {
    if (needsPagination(req)) {
      findWithPagination(Section, include, {
        page: Number(req.query.page),
        size: Number(req.query.size),
      }, null, res, (sections) => res.status(200).json(sections));
    } else find(null, res, (sections) => res.status(200).json(sections));
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
