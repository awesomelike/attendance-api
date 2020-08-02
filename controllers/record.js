import models from '../models';
import makeOptions from '../util/queryOptions';
import { FINISHED } from '../constants/classItems';
import bot from '../bot/utils/sender';

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
  async attend(req, res) {
    try {
      const recordId = parseInt(req.params.id, 10);
      const {
        classItemStatusId, student, courseName, sectionNumber, week, plannedDate,
      } = req.body;
      await Record.update({
        isAttended: true,
        isAdditional: classItemStatusId === FINISHED,
        attendedAt: Date.now(),
        rfid: null,
      }, {
        where: { id: recordId },
      });

      res.status(200).json({ record: { id: recordId, attendedAt: Date.now() } });

      const telegramAccount = await models.TelegramAccount.findOne({
        where: { studentId: student.id },
        attributes: ['chatId'],
      });
      if (telegramAccount) {
        return bot.sendAttendanceMessage(
          telegramAccount.chatId,
          student.uid,
          student.name,
          courseName,
          sectionNumber,
          week,
          plannedDate,
        );
      }
    } catch (error) {
      res.status(502).json(error.message);
    }
  },
  unattend(req, res) {
    const recordId = parseInt(req.params.id, 10);
    Record.update({
      isAttended: false,
      isAdditional: false,
      attendedAt: null,
      rfid: null,
    }, {
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
