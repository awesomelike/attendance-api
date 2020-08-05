import moment from 'moment';
import sequelize, { Op } from 'sequelize';
import models from '../models';
import { ACCEPTED } from '../constants/makeups';

const areStudentsFree = async (req, res, next) => {
  try {
    if (!req.query.timeSlots || !req.query.sectionId || !req.query.date) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }
    const { timeSlots, sectionId } = req.query;
    const parsedTimeSlots = JSON.parse(timeSlots);
    const date = parseInt(req.query.date, 10);
    const formatDate = moment(date).startOf('day').format('YYYY-MM-DD');

    const regular = await models.Section.findByPk(sectionId, {
      include: [
        {
          model: models.Student,
          as: 'students',
          attributes: ['uid', 'name'],
          include: [
            {
              model: models.Section,
              as: 'sections',
              required: true,
              attributes: ['id'],
              through: { attributes: [] },
              include: [
                {
                  model: models.Class,
                  as: 'classes',
                  attributes: ['id'],
                  required: true,
                  include: [
                    {
                      model: models.TimeSlot,
                      as: 'timeSlots',
                      attributes: ['id'],
                      where: { id: parsedTimeSlots },
                      through: { attributes: [] },
                    },
                    {
                      model: models.ClassItem,
                      as: 'classItems',
                      attributes: ['id', 'plannedDate'],
                      where: sequelize.where(sequelize.fn('DATE', sequelize.col('plannedDate')), formatDate),
                    },
                  ],
                },
              ],
            },
          ],
          through: { attributes: [] },
        },
      ],
    });
    const makeup = await models.Section.findByPk(sectionId, {
      include: [
        {
          model: models.Student,
          as: 'students',
          attributes: ['uid', 'name'],
          include: [
            {
              model: models.Section,
              as: 'sections',
              required: true,
              attributes: ['id'],
              through: { attributes: [] },
              include: [
                {
                  model: models.Class,
                  as: 'classes',
                  attributes: ['id'],
                  required: true,
                  include: [
                    {
                      model: models.ClassItem,
                      as: 'classItems',
                      attributes: ['id', 'plannedDate'],
                      required: true,
                      include: [
                        {
                          model: models.Makeup,
                          as: 'makeup',
                          where: {
                            makeupStatusId: ACCEPTED,
                            [Op.and]: [
                              sequelize.where(sequelize.fn('DATE', sequelize.col('newDate')), formatDate),
                            ],
                          },
                          required: true,
                          include: [
                            {
                              model: models.TimeSlot,
                              as: 'timeSlots',
                              attributes: ['id'],
                              where: { id: parsedTimeSlots },
                              through: { attributes: [] },
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
          through: { attributes: [] },
        },
      ],
    });
    const busyStudents = regular.students.concat(makeup.students);
    req.busyStudents = busyStudents;
    next();
  } catch (error) {
    res.status(502).json(error.message);
  }
};

export { areStudentsFree as default };
