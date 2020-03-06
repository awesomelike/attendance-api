import students from './students';
import courses from './courses';
import timeslots from './timeslots';
import professors from './professors';
import semesters from './semesters';
import timetable from './timetable';

export default (app) => {
  app.use('/api/students', students);
  app.use('/api/professors', professors);
  app.use('/api/courses', courses);
  app.use('/api/timeslots', timeslots);
  app.use('/api/semesters', semesters);
  app.use('/api/timetable', timetable);
};
