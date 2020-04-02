import timetable from './timetable';
import auth from './auth';
import students from './students';
import professors from './professors';
import profile from './profile';
import courses from './courses';
import sections from './sections';
import classes from './classes';
import classItems from './classItems';
import timeslots from './timeslots';
import semesters from './semesters';
import records from './records';
import weekDays from './weekdays';
import rooms from './rooms';
import roles from './roles';
import permissions from './permissions';

export default (app) => {
  app.use('/api/auth', auth);
  app.use('/api/students', students);
  app.use('/api/professors', professors);
  app.use('/api/profile', profile);
  app.use('/api/courses', courses);
  app.use('/api/sections', sections);
  app.use('/api/classes', classes);
  app.use('/api/classItems', classItems);
  app.use('/api/timeslots', timeslots);
  app.use('/api/semesters', semesters);
  app.use('/api/timetable', timetable);
  app.use('/api/records', records);
  app.use('/api/weekDays', weekDays);
  app.use('/api/rooms', rooms);
  app.use('/api/roles', roles);
  app.use('/api/permissions', permissions);
};
