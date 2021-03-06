import models from '../models';
import executeMissedClasses from '../util/sql/missedClasses';
import { idOf } from '../util/id';
import { PROFESSOR, ASSISTANT } from '../data/seed/roles';

const { Course } = models;

const include = [
  {
    model: models.Section,
    as: 'sections',
  },
];

export default {
  async getAll(req, res) {
    const { roleId } = req.account;
    const { semesterId } = req;
    const where = { semesterId };
    if (idOf(PROFESSOR) === roleId || idOf(ASSISTANT) === roleId) {
      const { professorId } = req.account;
      where.professorId = professorId;
    }
    const professorCourses = await Course.findAll({
      include: [
        {
          model: models.Section,
          as: 'sections',
          where,
        },
      ],
    });
    res.status(200).json(professorCourses);
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
      const { semesterId } = req;
      const data = await executeMissedClasses(req.query.week, req.account.professorId, semesterId);
      if (req.query.format === 'excel') return res.xls(`Report_Misses_Until_Week${req.params.week}.xlsx`, data);
      res.status(200).json(data);
    } catch (error) {
      res.status(502).json(error.message);
    }
  },
  async getSemesterReport(req, res) {
    try {
      const data = await Course.findOne({
        where: { id: parseInt(req.query.courseId, 10) },
        attributes: ['id', 'name', 'courseNumber'],
        order: [[
          {
            model: models.Section, as: 'sections',
          },
          {
            model: models.Student, as: 'students',
          },
          {
            model: models.Record, as: 'records',
          },
          {
            model: models.ClassItem, as: 'classItem',
          },
          'week', 'ASC',
        ]],
        include: [
          {
            model: models.Section,
            as: 'sections',
            attributes: ['id', 'sectionNumber'],
            where: { id: parseInt(req.query.sectionId, 10) },
            include: [
              {
                model: models.Professor,
                as: 'professor',
                where: { id: parseInt(req.query.professorId, 10) },
                attributes: { include: ['id', 'uid', 'name'] },
              },
              {
                model: models.Student,
                as: 'students',
                attributes: ['id', 'uid', 'name', 'department', 'schoolYear'],
                through: { attributes: [] },
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
      });
      res.status(200).json(data);
    } catch (error) {
      res.status(502).json(error.message);
    }
  },
};
