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
    models.sequelize.query('SELECT\n'
    + 'courses.id AS courseId,\n'
      + 'courses.name AS courseName,\n'
      + 'records.studentId,\n'
      + 'students.uid,\n'
      + 'students.name,\n'
      + 'professors.name AS professorName,'
      + 'COUNT(records.isAttended) AS missCount\n'
  + 'FROM courses\n'
    + 'JOIN sections\n'
    + 'ON courses.id=sections.id\n'
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
    })
      .then((result) => res.status(200).json(result))
      .catch((err) => res.status(502).json(err));
    // const everything = [
    //   {
    //     model: models.Section,
    //     as: 'sections',
    //     attributes: [],
    //     include: [
    //       {
    //         model: models.Class,
    //         as: 'classes',
    //         attributes: [],
    //         include: [
    //           {
    //             model: models.ClassItem,
    //             as: 'classItems',
    //             attributes: [],
    //             where: {
    //               week: {
    //                 [Op.lte]: 7,
    //               },
    //             },
    //             include: [
    //               {
    //                 model: models.Record,
    //                 as: 'records',
    //                 attributes: ['studentId'],
    //                 where: {
    //                   isAttended: 0,
    //                 },
    //                 include: [
    //                   {
    //                     model: models.Student,
    //                     as: 'student',
    //                   },
    //                 ],
    //               },
    //             ],
    //           },
    //         ],
    //       },
    //     ],
    //   },
    // ];
    // Course.findAll({
    //   attributes: { include: ['id'] },
    //   include: everything,
    //   group: ['id', 'sections->classes->classItems->records->studentId'],
    // })
    //   .then((result) => res.status(200).json(result))
    //   .catch((error) => res.status(502).json(error));
  },
};
