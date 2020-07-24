import { Op } from 'sequelize';
import moment from 'moment';
import models from '../models';
import time from '../util/time';
import { FINISHED } from '../constants/classItems';
import { ACCEPTED } from '../constants/makeups';

const getProfessorByRfid = (rfid) => models.Professor.findOne({ where: { rfid } });

const classItemInclude = [
  {
    model: models.Class,
    as: 'class',
    include: [
      {
        model: models.TimeSlot,
        as: 'timeSlots',
        through: { attributes: [] },
      },
      {
        model: models.Room,
        as: 'room',
        attributes: ['id', 'label'],
      },
    ],
  },
  {
    model: models.Record,
    as: 'records',
    include: [
      {
        model: models.Student,
        as: 'student',
      },
    ],
  },
  {
    model: models.ClassItemStatus,
    as: 'status',
  },
];

const sectionInclude = [
  {
    model: models.Student,
    as: 'students',
    include: [
      {
        model: models.Section,
        as: 'sections',
        attributes: ['id'],
        through: { attributes: [] },
      },
    ],
    through: { attributes: [] },
    raw: true,
  },
  {
    model: models.Course,
    as: 'course',
    attributes: ['id', 'name'],
  },
];

export default async function getCurrentClassAndSection(req, res, next) {
  try {
    const rfid = req.body.rfid || req.params.rfid;
    const professor = await getProfessorByRfid(rfid);
    if (!professor) return res.status(404).json({ error: 'No such professor!' });

    const timeSlotId = time.getCurrentTimeSlotId();
    if (!timeSlotId) return res.status(404).json({ error: 'You have no classes right now!' });

    const timeSlot = await models.TimeSlot.findByPk(timeSlotId);
    const professorSections = await professor.getSections();
    const currentClasses = await timeSlot.getClasses({
      where: {
        weekDayId: (new Date(2020, 2, 30, 10, 35, 0)).getDay(),
      },
    });

    if (!currentClasses.length) return res.status(404).json({ error: 'No classes today!' });

    const classNow = currentClasses
      .find((currentClass) => professorSections.map((section) => section.id)
        .includes(currentClass.sectionId));
    let [currentClassItem] = await classNow.getClassItems({
      where: {
        week: await time.getCurrentWeek(),
        classItemStatusId: { [Op.ne]: FINISHED },
      },
      include: classItemInclude,
    });
    let currentSection = null;
    if (!currentClassItem) {
      /*
        So, by timetable there is no class for the current moment.
        Now we look for a valid makeup class if it exists
      */

      const makeups = await models.Makeup.findAll({
        where: {
          professorId: professor.id,
          makeupStatusId: ACCEPTED,
        },
        include: [
          {
            model: models.TimeSlot,
            as: 'timeSlots',
            through: { attributes: [] },
          },
        ],
      });
      const isToday = (date) => moment(date).startOf('day').valueOf() === moment(new Date(2020, 6, 31)).startOf('day').valueOf();
      const todayMakeups = makeups.filter(({ newDate }) => isToday(newDate));
      const currentMakeup = todayMakeups
        .find(({ timeSlots: t }) => t.map(({ id }) => id).includes(timeSlotId));
      if (!currentMakeup) {
        return res.status(406).json({ error: 'You have no planned classes for now' });
      }
      currentClassItem = await currentMakeup.getClassItem({ include: classItemInclude });
      currentClassItem.dataValues.isMakeup = true;
      currentSection = await currentClassItem.class.getSection({ include: sectionInclude });
    } else {
      currentClassItem.dataValues.isMakeup = false;
      currentSection = await classNow.getSection({ include: sectionInclude });
    }

    req.classAndSection = { currentClassItem, currentSection, professor };
    next();
  } catch (error) {
    console.log(error.message);
    res.status(502).json(error.message);
  }
}
