import { checkSchema, validationResult } from 'express-validator';

export const check = checkSchema({
  name: {
    isString: true,
  },
  permissions: {
    isArray: true,
  },
});

// eslint-disable-next-line consistent-return
export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  req.role = {
    name: req.body.name,
    permissions: req.body.permissions,
  };
  next();
}
