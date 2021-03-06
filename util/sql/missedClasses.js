import { QueryTypes } from 'sequelize';
import models from '../../models';

export const executeMissedAtDangerZone = (
  currentWeek,
  courseId,
  semesterId,
) => models.sequelize.query(`SELECT
courses.name AS CourseName,
courses.id as CourseId,
students.id,
students.uid AS StudentID,
students.name AS Name,
professors.name AS Professor,
COUNT(records.isAttended) AS MissedClasses
FROM courses
JOIN sections
ON courses.id=sections.courseId
JOIN classes
ON sections.id=classes.sectionId
JOIN classitems
ON classes.id=classitems.classId
JOIN records
ON classitems.id=records.classItemId
JOIN students
ON students.id=records.studentId
JOIN professors
ON professors.id=sections.professorId
WHERE records.isAttended=0 AND classitems.week<=:week AND CourseId=:courseId AND sections.semesterId=:semesterId
GROUP BY
records.studentId, courses.id
HAVING MissedClasses=3 OR MissedClasses=4 OR MissedClasses=7 OR MissedClasses=8`, {
  replacements: {
    week: parseInt(currentWeek, 10),
    courseId: parseInt(courseId, 10),
    semesterId,
  },
  type: QueryTypes.SELECT,
});

export default (week, professorId, semesterId) => models.sequelize.query('SELECT\n'
  + 'courses.name AS CourseName,\n'
  + 'students.uid AS StudentID,\n'
  + 'students.name AS Name,\n'
  + 'professors.name AS Professor,\n'
  + 'COUNT(records.isAttended) AS MissedClasses\n'
+ 'FROM courses\n'
+ 'LEFT JOIN sections\n'
+ 'ON courses.id=sections.courseId\n'
+ 'LEFT JOIN classes\n'
+ 'ON sections.id=classes.sectionId\n'
+ 'LEFT JOIN classitems\n'
+ 'ON classes.id=classitems.classId\n'
+ 'LEFT JOIN records\n'
+ 'ON classitems.id=records.classItemId\n'
+ 'LEFT JOIN students\n'
+ 'ON students.id=records.studentId\n'
+ 'LEFT JOIN professors\n'
+ 'ON professors.id=sections.professorId\n'
+ 'WHERE records.isAttended=0 AND classitems.week <= :week AND sections.semesterId=:semesterId\n'
+ `${professorId ? 'AND professors.id=:professorId\n' : ''}`
+ 'GROUP BY\n'
+ 'records.studentId, courses.id\n', {
  replacements: {
    week: parseInt(week, 10),
    professorId,
    semesterId,
  },
  type: QueryTypes.SELECT,
});
