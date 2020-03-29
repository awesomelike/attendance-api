import { Op } from 'sequelize';
import models from '../models';
import findWithPagination, { needsPagination } from '../util/pagination';

const { Student } = models;


const include = [
  {
    model: models.Record,
    as: 'records',
    include: [
      {
        model: models.ClassItem,
        as: 'classItem',
        include: [
          {
            model: models.Class,
            as: 'class',
            include: [
              {
                model: models.WeekDay,
                as: 'weekDay',
              },
              {
                model: models.TimeSlot,
                as: 'timeSlots',
              },

            ],
          },
        ],
      },
    ],
  },
  {
    model: models.Section,
    as: 'sections',
    include: [
      {
        model: models.Course,
        as: 'course',
      },
      {
        model: models.Professor,
        as: 'professor',
      },
    ],
    through: {
      model: models.StudentSection,
      as: 'studentSections',
      attributes: [],
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

export default {
  get(req, res) {
    Student.findByPk(req.params.id, { include })
      .then((student) => res.status(200).json(student))
      .catch((error) => res.status(502).json(error));
  },
  async getAll(req, res) {
    const where = {};
    if (Object.keys(req.query).length > 0) {
      Object.keys(req.query).forEach((key) => {
        if (key !== 'page' && key !== 'size') {
          if (['name', 'uid', 'rfid'].includes(key)) {
            where[key] = {
              [Op.like]: `%${req.query[key]}%`,
            };
          } else {
            where[key] = Number(req.query.key);
          }
        }
      });
      if (needsPagination(req)) {
        findWithPagination(Student, include, {
          page: Number(req.query.page),
          size: Number(req.query.size),
        }, where, res, (students) => {
          res.status(200).json(students);
        });
      } else res.status(200).json(await Student.findAll({ where }));
    } else find(null, res, (students) => res.status(200).json(students));
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

      /* If the code below is reached, it means: no record is updated,
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
  getTimetable(req, res) {
    const timetableInclude = [
      {
        model: models.Section,
        as: 'sections',
        through: {
          model: models.StudentSection,
          as: 'studentSections',
          attributes: [],
        },
        include: [
          {
            model: models.Professor,
            as: 'professor',
          },
          {
            model: models.Course,
            as: 'course',
          },
          {
            model: models.Class,
            as: 'classes',
            include: [
              {
                model: models.WeekDay,
                as: 'weekDay',
              },
              {
                model: models.TimeSlot,
                as: 'timeSlots',
                through: {
                  model: models.ClassTimeSlot,
                  as: 'classTimeSlots',
                  attributes: [],
                },
              },
            ],
          },
        ],
      },
    ];
    Student.findByPk(req.params.id, { include: timetableInclude })
      .then((student) => res.status(200).json(student))
      .catch((error) => res.status(502).json(error));
  },
  // getSemesterReport(req, res) {
  //   Student.findAll({
  //     include:
  //   })
  // },
};
