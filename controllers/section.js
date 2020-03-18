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

export default {
  getAll(req, res) {
    if (needsPagination(req)) {
      findWithPagination(Section, include, {
        page: Number(req.query.page),
        size: Number(req.query.size),
      }, null, res, (sections) => res.status(200).json(sections));
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
};
