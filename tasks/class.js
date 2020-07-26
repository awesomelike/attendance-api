import { CronJob } from 'cron';
import moment from 'moment';
import { Op } from 'sequelize';
import models from '../models';
import time, { parseTime, TIME } from '../util/time';

const { ClassItem, Student } = models;

const startedClasses = (now, week) => ClassItem.findAll({
  where: {
    plannedDate: {
      [Op.between]: [now.subtract(1, 'minutes').valueOf(), now.add(1, 'minutes').valueOf()],
    },
  },
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

const finishedClasses = (now, week) => new Promise((resolve) => {
  ClassItem.findAll({
    where: { week },
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
        console.log(classItems[0].class.timeSlots.map(({ endTime }) => endTime));
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
          if (i === 0) {
            console.log('before: ', now.subtract(1, 'minutes').format('HH:mm DD/MM/YYYY'));
            console.log('between', moment(item.plannedDate).startOf('day')
              .add(hour, 'hours')
              .add(minute, 'minutes')
              .format('HH:mm DD/MM/YYYY'));
            console.log('after: ', now.add(1, 'minutes').format('HH:mm DD/MM/YYYY'));
          }
          const isBetween = nowTime >= now.subtract(1, 'minutes').valueOf() && nowTime <= now.add(1, 'minutes').valueOf();
          if (isBetween) { results.push(item); }
        }
        resolve(results);
      } else resolve([]);
    });
});


const ClassJob = new CronJob('* * * * *', async () => {
  try {
    console.log('ClassJob fired!');
    console.log(moment(TIME).format('HH:mm DD/MM/YYYY'));
    const now = moment(TIME);
    const week = await time.getCurrentWeek();

    const started = await startedClasses(now, week);
    const finished = await finishedClasses(now, week);

    // console.log(started.map(({ id }) => id));
    // console.log(finished.map(({ id }) => id));

    const flatten = (array) => array
      .map(({ class: { section: { students } } }) => students.map(({ id }) => id))
      .reduce((prev, curr) => prev.concat(curr), []);

    const startedStudents = flatten(started);
    const finishedStudents = flatten(finished);

    console.log('started', startedStudents);
    console.log('finished', finishedStudents);

    Student.update({ inClass: true }, { where: { id: startedStudents } });
    Student.update({ inClass: false }, { where: { id: finishedStudents } });
  } catch (error) {
    console.log('ClassJob Error:', error.message);
  }
});

ClassJob.start();
