import { checkSchema, validationResult } from 'express-validator/check';
import { Op } from 'sequelize';
import { Semester } from '../../models';

export const check = checkSchema({
  year: {
    isInt: true,
  },
  season: {
    isString: true,
    custom: {
      options: (value) => ['Fall', 'Spring', 'Summer'].includes(value),
      errorMessage: 'This can be either Fall, Spring or Summer',
    },
  },
  startDate: {
    isInt: true,
  },
  endDate: {
    isInt: true,
    custom: {
      options: async (value, { req }) => {
        const isGreater = value > req.body.startDate;
        const semester = await Semester.findOne({ where: { endDate: { [Op.gte]: Date.now() } }, attributes: ['id'], raw: true });
        return isGreater && !semester;
      },
      errorMessage: 'There is already an ongoing semester or invalid data provided',
    },
  },
});

export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  req.semester = {
    year: req.body.year,
    season: req.body.season,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
  };
  next();
}
