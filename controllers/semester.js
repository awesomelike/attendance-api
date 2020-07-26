import { Op } from 'sequelize';
import models from '../models';
import appEmitter from '../events/app';
import cache from '../cache';

const { Semester } = models;

const setCache = async (callback) => {
  const semester = await Semester.findOne({ where: { endDate: { [Op.gte]: Date.now() } }, attributes: ['id', 'startDate', 'endDate'] });
  if (!semester) return callback(null);
  const data = { id: semester.id, startDate: semester.startDate, endDate: semester.endDate };
  cache.set('SEMESTER', data);
  callback(data);
};

appEmitter.on('started', async () => {
  setCache(() => console.log('Cache has been initialized'));
});

export const getCurrentSemester = () => new Promise((resolve) => {
  const value = cache.get('SEMESTER');
  if (!value) {
    setCache((semester) => {
      if (!semester) resolve(null);
      console.log('Cache has been set');
      resolve(cache.get('SEMESTER'));
    });
  }
  resolve(value);
});

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
