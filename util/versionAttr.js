import { Sequelize } from '../models';

require('dotenv').config();

export default [
  'id',
  'semesterId',
  'fileStudents',
  'fileTimetable',
  [Sequelize.fn('CONCAT', process.env.BASE_URL, Sequelize.col('fileStudents')), 'fileStudents'],
  [Sequelize.fn('CONCAT', process.env.BASE_URL, Sequelize.col('fileTimetable')), 'fileTimetable'],
  'addedById',
  'createdAt',
];
