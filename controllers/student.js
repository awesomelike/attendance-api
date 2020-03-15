import { Op } from 'sequelize';
import models from '../models';

const { Student } = models;

const include = [
  {
    model: models.Record,
    as: 'records',
  },
  {
    model: models.Section,
    as: 'sections',
    include: [
      {
        model: models.Class,
        as: 'classes',
        include: [
          {
            model: models.ClassItem,
            as: 'classItems',
          },
        ],
      },
    ],
    through: {
      model: models.StudentSection,
      as: 'studentSections',
    },
  },
];

function find(where, res, next) {
  Student.findAll({
    where,
    include,
  })
    .then((items) => next(items))
    .catch((error) => res.status(502).json(error));
}

function findWithPagination({ page = 1, size = Number.MAX_SAFE_INTEGER }, where, res, next) {
  const limit = size;
  const offset = (page - 1) * size;
  Student.findAll({
    where,
    include,
    limit,
    offset,
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
    Student.findByPk(req.params.id, { include })
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
      } else res.status(200).json(await Student.findAll({ where }));
    } else res.status(400).json({ message: 'Please provide some search filters' });
  },
  async handleRfid(req, res) {
    const { rfid } = req;
    const { classItemId } = req.body;
    const { sectionId } = req.body;

    const student = await Student.findOne({ where: { rfid }, include });
    if (!student) return res.status(404).json({ error: 'No student found' });

    const record = {
      isAttended: 1,
      isAdditional: student.sections.map(({ id }) => id).indexOf(sectionId) > -1 ? 0 : 1,
      rfid,
    };
    try {
      const [isUpdated] = await models.Record.update(record, {
        where: {
          classItemId,
          studentId: student.id,
        },
      });
      if (isUpdated) {
        return res.status(200).json(await models.Record.findOne({
          where: {
            studentId: student.id,
            classItemId,
          },
        }));
      }

      /* This part is reached, means: no record is updated,
      then this student does not belong to this section, and we
      add this student as additional */

      const newRecord = await models.Record.create({
        classItemId,
        rfid,
        studentId: student.id,
        isAdditional: 1,
        isAttended: 1,
      });
      res.status(200).json(newRecord);
    } catch (error) {
      res.status(502).json(error);
    }
  },
};
