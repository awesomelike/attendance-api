import models from '../models';
import bot from '../bot/utils/sender';
import cache from '../cache';
import makeOptions from '../util/queryOptions';

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

export const areStudentsFree = async (req, res) => {
  const { busyStudents } = req;
  res.status(200).json({
    allAreFree: !busyStudents.length,
    busyStudents,
  });
};

export default {
  async get(req, res) {
    try {
      const student = await Student.findByPk(req.params.id, { include });
      res.status(200).json(student);
    } catch (error) {
      console.log(error);
      res.status(502).json(error.message);
    }
  },
  async getAll(req, res) {
    try {
      const students = await Student.findAll(makeOptions(req, {
        include,
        likeProps: ['name', 'uid', 'rfid'],
      }));
      res.status(200).json(students);
    } catch (error) {
      console.log(error);
      res.status(502).json(error.message);
    }
  },

  async handleRfid(req, res) {
    const { rfid } = req;
    const {
      recordId, classItemId, sectionId, sectionNumber, courseName, week, date,
    } = req.body;
    // const student = await Student.findOne({
    //   where: { rfid },
    //   include: [
    //     {
    //       model: models.Section,
    //       as: 'sections',
    //       attributes: ['id'],
    //       through: { attributes: [] },
    //     },
    //   ],
    // });
    const student = cache.get(rfid);
    if (!student) return res.status(404).json({ error: 'No student found' });

    const isStranger = student.sections.indexOf(sectionId) === -1;

    const record = {
      isAttended: 1,
      attendedAt: Date.now(),
      isAdditional: isStranger,
      rfid,
    };
    try {
      await models.Record.update(record, {
        where: {
          id: recordId,
        },
      });
      student.isAttended = true;

      const response = {
        studentId: student.id,
        uid: student.uid,
        name: student.name,
        record: { id: recordId, attendedAt: Date.now() },
      };
      if (!isStranger) {
        res.status(200).json(response);
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
            date,
          );
        }
      } else if (isStranger) {
        /* If the code below is reached, it means: no record is updated,
        then this student does not belong to this section, and we
        add this student as additional */

        const newRecord = await models.Record.create({
          classItemId,
          rfid,
          studentId: student.id,
          isAdditional: 1,
          isAttended: 1,
          attendedAt: (new Date()).getTime(),
        });
        res.status(200).json(newRecord);
      }
    } catch (error) {
      console.log(error);
      res.status(502).json(error);
    }
  },
  async getTimetable(req, res) {
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
    try {
      const student = await Student.findByPk(req.params.id, { include: timetableInclude });
      res.status(200).json(student);
    } catch (error) {
      res.status(502).json(error);
    }
  },
};
