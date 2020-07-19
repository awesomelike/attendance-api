import models from '../models';
import time from '../util/time';

const getProfessorByRfid = (rfid) => models.Professor.findOne({ where: { rfid } });

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
    const [currentClassItem] = await classNow.getClassItems({
      where: {
        week: await time.getCurrentWeek(),
      },
      include: [
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
      ],
    });
    const currentSection = await classNow.getSection({
      include: [
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
      ],
    });
    req.classAndSection = { currentClassItem, currentSection, professor };
    next();
  } catch (error) {
    console.log(error.message);
    res.status(502).json(error.message);
  }
}
