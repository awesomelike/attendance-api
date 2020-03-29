import timetable from './timetable';
import students from './students';
import professors from './professors';
import courses from './courses';
import sections from './sections';
import classes from './classes';
import classItems from './classItems';
import timeslots from './timeslots';
import semesters from './semesters';
import records from './records';
import weekDays from './weekdays';

export default (app) => {
  app.use('/api/students', students);
  app.use('/api/professors', professors);
  app.use('/api/courses', courses);
  app.use('/api/sections', sections);
  app.use('/api/classes', classes);
  app.use('/api/classItems', classItems);
  app.use('/api/timeslots', timeslots);
  app.use('/api/semesters', semesters);
  app.use('/api/timetable', timetable);
  app.use('/api/records', records);
  app.use('/api/weekDays', weekDays);
};
