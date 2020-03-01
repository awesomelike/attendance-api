import { checkSchema, validationResult } from 'express-validator/check';

export const checkRfid = checkSchema({
  rfid: {
    isString: true,
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
