import { checkSchema, validationResult } from 'express-validator/check';

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
