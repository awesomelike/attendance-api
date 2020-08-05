import { CronJob } from 'cron';
import moment from 'moment';
import sequelize, { Op } from 'sequelize';
import models from '../models';
import time, { parseTime, TIME } from '../util/time';
import { GOING_ON, FINISHED } from '../constants/classItems';
import { notifyStudents } from '../controllers/classItem';
import { executeMissedAtDangerZone } from '../util/sql/missedClasses';
import { getCurrentSemester } from '../controllers/semester';

const { ClassItem, Student } = models;

const startedClasses = (now) => ClassItem.findAll({
  where: { plannedDate: now.valueOf() },
  attributes: ['id', 'classId', 'plannedDate'],
  include: [
    {
      model: models.Class,
      as: 'class',
      attributes: ['id', 'sectionId'],
      include: [
        {
          model: models.Section,
          as: 'section',
          attributes: ['id'],
          include: [
            {
              model: models.Student,
              as: 'students',
              attributes: ['id'],
              through: { attributes: [] },
            },
          ],
        },
      ],
    },
  ],
});

const finishedClasses = (now) => {
  const clonedNow = now.clone();
  const date = clonedNow.startOf('day').format('YYYY-MM-DD');
  return new Promise((resolve) => {
    ClassItem.findAll({
      where: {
        classItemStatusId: GOING_ON,
        [Op.and]: [
          sequelize.where(sequelize.fn('DATE', sequelize.col('plannedDate')), date),
        ],
      },
      include: [
        {
          model: models.Class,
          as: 'class',
          include: [
            {
              model: models.TimeSlot,
              as: 'timeSlots',
            },
            {
              model: models.Section,
              as: 'section',
              attributes: ['id'],
              include: [
                {
                  model: models.Course,
                  as: 'course',
                  attributes: ['id'],
                },
                {
                  model: models.Student,
                  as: 'students',
                  attributes: ['id'],
                  through: { attributes: [] },
                },
              ],
            },
          ],
        },
      ],
    })
      .then((classItems) => {
        if (classItems.length) {
          const results = [];
          for (let i = 0; i < classItems.length; i += 1) {
            const item = classItems[i];
            const { class: { timeSlots } } = item;
            const { endTime } = timeSlots.slice(-1)[0];
            const { hour, minute } = parseTime(endTime);
            const nowTime = moment(item.plannedDate)
              .startOf('day')
              .add(hour, 'hours')
              .add(minute, 'minutes')
              .valueOf();
            if (nowTime === now.valueOf()) { results.push(item); }
          }
          resolve(results);
        } else resolve([]);
      });
  });
};

const ClassJob = new CronJob('* * * * *', async () => {
  try {
    console.log('ClassJob fired!');

    const semester = await getCurrentSemester();
    if (!semester) return;

    const { id: semesterId } = semester;
    const now = moment(TIME).seconds(0).milliseconds(0);

    const finished = await finishedClasses(now);
    const started = await startedClasses(now);

    // Update classItems' statuses
    ClassItem.update({ classItemStatusId: FINISHED }, {
      where: { id: finished.map(({ id }) => id) },
    });

    // Send emails
    const currentWeek = await time.getCurrentWeek();

    const sendEmailTasks = [];
    finished.forEach((classItem) => {
      const courseId = classItem.class.section.course.id;
      sendEmailTasks.push(executeMissedAtDangerZone(currentWeek, courseId, semesterId));
    });

    const dangerZoneStudents = (await Promise.all(sendEmailTasks))
      .reduce((prev, curr) => prev.concat(curr), []);

    if (dangerZoneStudents.length) {
      notifyStudents(dangerZoneStudents);
    }

    const flatten = (array) => array
      .map(({ class: { section: { students } } }) => students.map(({ id }) => id))
      .reduce((prev, curr) => prev.concat(curr), []);

    const startedStudents = flatten(started);
    const finishedStudents = flatten(finished);

    // console.log('started', startedStudents);
    // console.log('finished', finishedStudents);

    await Student.update({ inClass: false }, { where: { id: finishedStudents } });
    await Student.update({ inClass: true }, { where: { id: startedStudents } });
  } catch (error) {
    console.log('ClassJob Error:', error.message);
  }
});

ClassJob.start();
