/* eslint-disable import/prefer-default-export */
import { QueryTypes } from 'sequelize';
import models from '../../models';

export const getPlannedLectures = () => new Promise((resolve, reject) => {
  models.sequelize.query(`
    SELECT professors.id AS id, professors.name AS Professor, courses.name as Course, COUNT(classitems.id) AS Planned
FROM sections
LEFT JOIN professors
ON professors.id=sections.professorId
LEFT JOIN courses
ON sections.courseId=courses.id
LEFT JOIN classes
ON sections.id=classes.sectionId
LEFT JOIN classitems
ON classes.id=classitems.classId
GROUP BY professors.id, courses.id`, {
    type: QueryTypes.SELECT,
  })
    .then((result) => resolve(result))
    .catch((error) => reject(error));
});

export const getGivenLectures = () => new Promise((resolve, reject) => {
  models.sequelize.query(`
SELECT professors.id AS id, professors.name AS Professor, courses.name as Course, COUNT(classitems.id) AS Given
FROM sections
LEFT JOIN professors
ON professors.id=sections.professorId
LEFT JOIN courses
ON sections.courseId=courses.id
LEFT JOIN classes
ON sections.id=classes.sectionId
LEFT JOIN classitems
ON classes.id=classitems.classId
WHERE classitems.classItemStatusId=3
GROUP BY professors.id, courses.id`, {
    type: QueryTypes.SELECT,
  })
    .then((result) => resolve(result))
    .catch((error) => reject(error));
});
