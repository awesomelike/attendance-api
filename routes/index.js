import timetable from './timetable';
import students from './students';
import sections from './sections';
import courses from './courses';
import timeslots from './timeslots';
import professors from './professors';
import semesters from './semesters';
import records from './records';

export default (app) => {
  app.use('/api/students', students);
  app.use('/api/professors', professors);
  app.use('/api/courses', courses);
  app.use('/api/sections', sections);
  app.use('/api/timeslots', timeslots);
  app.use('/api/semesters', semesters);
  app.use('/api/timetable', timetable);
  app.use('/api/records', records);
};
