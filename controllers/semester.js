import { Op } from 'sequelize';
import models from '../models';
import appEmitter from '../events/app';
import cache from '../cache';
import makeOptions from '../util/queryOptions';

const { Semester } = models;

const setCache = async (callback) => {
  const semester = await Semester.findOne({ where: { endDate: { [Op.gte]: Date.now() } }, attributes: ['id', 'startDate', 'endDate'], raw: true });
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

const include = [
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
];

// eslint-disable-next-line no-param-reassign
const setStatus = ({ dataValues }) => { dataValues.status = new Date(dataValues.endDate).getTime() > Date.now() ? 'Ongoing' : 'Finished'; };

export default {
  async getAll(req, res) {
    try {
      const semesters = await Semester.findAll(makeOptions(req, { order: [['id', 'DESC']] }));
      semesters.forEach(setStatus);
      res.status(200).json(semesters);
    } catch (error) {
      res.status(502).json(error);
    }
  },
  async get(req, res) {
    try {
      const semester = await Semester.findByPk(req.params.id, { include });
      setStatus(semester);
      res.status(200).json(semester);
    } catch (error) {
      res.status(502).json(error);
    }
  },
  async create(req, res) {
    try {
      const semester = await Semester.create(req.semester);
      res.status(200).json(semester);
    } catch (error) {
      console.log(error);
      res.status(502).json(error.message);
    }
  },
};
