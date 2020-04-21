import { QueryTypes } from 'sequelize';
import models from '../../models';

export default (professorId) => new Promise((resolve, reject) => {
  models.sequelize.query(`SELECT courses.id AS courseId, courses.name
  FROM professors
  LEFT JOIN sections
  ON professors.id=sections.professorId
  LEFT JOIN courses
  ON sections.courseId=courses.id
  WHERE professors.id=:professorId
  GROUP BY courseId`, {
    replacements: {
      professorId,
    },
    type: QueryTypes.SELECT,
  })
    .then((results) => resolve(results))
    .catch((error) => reject(error));
});
