import { QueryTypes } from 'sequelize';
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
  async getSections(req, res) {
    try {
      const course = await Course.findByPk(req.params.id);
      const sections = await course.getSections({
        include: [
          {
            model: models.Professor,
            as: 'professor',
          },
        ],
      });
      if (sections.length) res.status(200).json(sections);
      else res.sendStatus(404);
    } catch (error) {
      res.status(502).json(error);
    }
  },
  async getMissedClasses(req, res) {
    try {
      const data = await models.sequelize.query('SELECT\n'
      + 'courses.name AS CourseName,\n'
      + 'students.uid AS StudentID,\n'
      + 'students.name AS Name,\n'
      + 'professors.name AS Professor,\n'
      + 'COUNT(records.isAttended) AS MissedClasses\n'
  + 'FROM courses\n'
    + 'JOIN sections\n'
    + 'ON courses.id=sections.courseId\n'
    + 'JOIN classes\n'
    + 'ON sections.id=classes.sectionId\n'
    + 'JOIN classitems\n'
    + 'ON classes.id=classitems.classId\n'
    + 'JOIN records\n'
    + 'ON classitems.id=records.classItemId\n'
    + 'JOIN students\n'
    + 'ON students.id=records.studentId\n'
    + 'JOIN professors\n'
    + 'ON professors.id=sections.professorId\n'
    + 'WHERE records.isAttended=0 AND classitems.week <= :week\n'
  + 'GROUP BY\n'
    + 'records.studentId, courses.id\n', {
        replacements: {
          week: parseInt(req.params.week, 10),
        },
        type: QueryTypes.SELECT,
      });
      if (req.query.format === 'excel') return res.xls(`Report_Misses_Until_Week${req.params.week}.xlsx`, data);
      res.status(200).json(data);
    } catch (error) {
      res.status(502).json(error);
    }
  },
  getSemesterReport(req, res) {
    Course.findOne({
      where: {
        id: Number(req.query.courseId),
      },
      attributes: ['id', 'name', 'courseNumber'],
      include: [
        {
          model: models.Section,
          as: 'sections',
          attributes: ['id', 'sectionNumber'],
          where: {
            id: Number(req.query.sectionId),
          },
          include: [
            {
              model: models.Professor,
              as: 'professor',
              where: {
                id: Number(req.query.professorId),
              },
              attributes: { include: ['id', 'uid', 'name'] },
            },
            {
              model: models.Student,
              as: 'students',
              attributes: ['id', 'uid', 'name', 'department', 'schoolYear'],
              through: {
                attributes: [],
              },
              include: [
                {
                  model: models.Record,
                  as: 'records',
                  attributes: { exclude: ['createdAt', 'updatedAt'] },
                  include: [
                    {
                      model: models.ClassItem,
                      as: 'classItem',
                      attributes: { exclude: ['createdAt', 'updatedAt'] },
                      include: [
                        {
                          model: models.Class,
                          as: 'class',
                          attributes: { exclude: ['createdAt', 'updatedAt'] },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    })
      .then((result) => res.status(200).json(result))
      .catch((error) => res.status(502).json(error));
  },
};
