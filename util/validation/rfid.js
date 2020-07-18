import { checkSchema, validationResult } from 'express-validator/check';

export const checkProfessorRfid = checkSchema({
  rfid: {
    isString: true,
  },
});

export const checkStudentRfid = checkSchema({
  rfid: {
    isString: true,
  },
  classItemId: {
    isInt: true,
  },
  sectionId: {
    isInt: true,
  },
  sectionNumber: {
    isString: true,
  },
  courseName: {
    isString: true,
  },
  week: {
    isInt: true,
  },
  date: {
    isInt: true,
  },
});

// eslint-disable-next-line consistent-return
export function validateRfid(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  req.rfid = req.body.rfid;
  next();
}
