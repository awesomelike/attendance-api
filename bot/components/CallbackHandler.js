import { QueryTypes } from 'sequelize';
import bot from '../config';
import models from '../../models';
import reportMessage from '../messages/report';

export default bot.on('callback_query', async (query) => {
  const data = JSON.parse(query.data);
  switch (data.action) {
    case 'course': {
      const [result] = await models.sequelize.query(`
      SELECT 
      courses.id AS course_id, 
      courses.name AS courseName, 
      sections.sectionNumber,
      records.studentId,
      students.uid,
      students.name,
      professors.name AS professorName,
      COUNT(records.isAttended) AS absences
      FROM courses
      JOIN sections
      ON courses.id=sections.id
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
      WHERE records.isAttended=0 AND courses.id=:courseId AND students.id=:studentId
      GROUP BY 
      records.studentId, courses.id
      `, {
        replacements: {
          studentId: data.studentId,
          courseId: data.courseId,
        },
        type: QueryTypes.SELECT,
      });
      if (!result) return bot.sendMessage(query.message.chat.id, 'No data available!');
      bot.sendMessage(query.message.chat.id, reportMessage(result), {
        parse_mode: 'Markdown',
      });
      break;
    }

    default:
      break;
  }
});
