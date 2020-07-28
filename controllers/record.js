
import models from '../models';
import makeOptions from '../util/queryOptions';

const { Record } = models;

const include = [
  {
    model: models.ClassItem,
    as: 'classItem',
    include: [
      {
        model: models.Class,
        as: 'class',
        include: [
          {
            model: models.Section,
            as: 'section',
            include: [
              {
                model: models.Professor,
                as: 'professor',
              },
              {
                model: models.Course,
                as: 'course',
              },
            ],
          },
        ],
      },
    ],
  },
];

export default {
  async getAll(req, res) {
    try {
      const records = await Record.findAll(makeOptions(req, { include }));
      res.status(200).json(records);
    } catch (error) {
      console.log(error);
      res.status(502).json(error.message);
    }
  },
  attend(req, res) {
    const recordId = parseInt(req.params.id, 10);
    Record.update({ isAttended: true, attendedAt: Date.now(), rfid: null }, {
      where: { id: recordId },
    })
      .then(() => res.status(200).json({ record: { id: recordId, attendedAt: Date.now() } }))
      .catch((error) => res.sendStatus(502).json(error.message));
  },
  unattend(req, res) {
    const recordId = parseInt(req.params.id, 10);
    Record.update({ isAttended: false, attendedAt: null, rfid: null }, {
      where: { id: recordId },
    })
      .then(() => res.status(200).json({ record: { id: recordId, attendedAt: null } }))
      .catch((error) => res.sendStatus(502).json(error.message));
  },
  async getClassRecords(req, res) {
    try {
      const week = parseInt(req.query.week, 10);
      const sectionId = parseInt(req.query.sectionId, 10);
      const records = await Record.findAll({
        include: [
          {
            model: models.ClassItem,
            as: 'classItem',
            where: { week },
          },
          {
            model: models.Student,
            as: 'student',
          },
        ],
      });
      res.status(200).json(records);
    } catch (error) {
      console.log(error);
      res.status(502).json(error);
    }
  },
};
