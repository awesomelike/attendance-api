import { Op } from 'sequelize';
import { basename } from 'path';
import models from '../models';
import appEmitter from '../events/app';
import cache from '../cache';
import makeOptions from '../util/queryOptions';
import versionAttr from '../util/versionAttr';

const { Semester } = models;

const setCache = async (callback) => {
  const semester = await Semester.findOne({ where: { endDate: { [Op.gte]: Date.now() } }, attributes: ['id', 'startDate', 'endDate', 'year', 'season'], raw: true });
  if (!semester) return callback(null);
  const data = {
    id: semester.id,
    startDate: semester.startDate,
    endDate: semester.endDate,
    year: semester.year,
    season: semester.season,
  };
  cache.set('SEMESTER', data);
  callback(data);
};

appEmitter.on('started', async () => {
  setCache(() => console.log('Cache has been initialized'));
  setInterval(() => {
    setCache(() => console.log('Cache has been updated'));
  }, 60 * 1000);
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
    model: models.TimetableVersion,
    as: 'versions',
    attributes: ['id'],
  },
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
export const setNames = ({ dataValues }) => {
  if (dataValues.fileStudents) {
    // eslint-disable-next-line no-param-reassign
    dataValues.fileStudentsName = basename(dataValues.fileStudents);
  }
  if (dataValues.fileTimetable) {
    // eslint-disable-next-line no-param-reassign
    dataValues.fileTimetableName = basename(dataValues.fileTimetable);
  }
};
export default {
  async getAll(req, res) {
    try {
      const semesters = await Semester.findAll(makeOptions(req, {
        order: [['id', 'DESC']],
        include,
      }));
      semesters.forEach(setStatus);
      res.status(200).json(semesters);
    } catch (error) {
      res.status(502).json(error.message);
    }
  },
  async getCurrent(req, res) {
    try {
      const semester = await getCurrentSemester();
      res.status(200).json(semester);
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
      setCache(() => console.log('Cache updated!'));
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'This semester already exists!' });
      console.log(error);
      res.status(502).json(error.message);
    }
  },
  async delete(req, res) {
    try {
      const semester = await Semester.findByPk(req.params.id, {
        attributes: ['id'],
        include: [
          {
            model: models.TimetableVersion,
            as: 'versions',
            attributes: ['id'],
          },
        ],
      });
      if (!semester) { throw new Error('Semester does not exist'); }
      if (semester.versions.length) { throw new Error('This already has a timetable!'); }
      await models.Semester.destroy({ where: { id: req.params.id } });
      res.sendStatus(200);
    } catch (error) {
      res.status(502).json(error.message);
    }
  },
  async getVersions(req, res) {
    try {
      const semester = await Semester.findByPk(req.params.id, {
        order: [[{ model: models.TimetableVersion, as: 'versions' }, 'createdAt', 'DESC']],
        include: [
          {
            model: models.TimetableVersion,
            as: 'versions',
            attributes: versionAttr,
            include: [
              {
                model: models.Account,
                as: 'addedBy',
              },
            ],
          },
        ],
      });
      if (!semester) return res.status(400).json({ error: 'No semester found!' });

      semester.versions.forEach(setNames);

      res.status(200).json(semester);
    } catch (error) {
      res.status(502).json(error.message);
    }
  },
};
