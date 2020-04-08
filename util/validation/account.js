import { checkSchema, validationResult } from 'express-validator/check';
import { hashSync, genSaltSync } from 'bcryptjs';

export const check = (type) => {
  const schema = {
    username: {
      isString: true,
    },
    name: {
      isString: true,
    },
    email: {
      isEmail: true,
    },
    roleId: {
      isInt: true,
    },
    accountStatus: {
      isInt: true,
      custom: {
        options: (value) => [0, 1].includes(value),
        errorMessage: 'This value can be either 0 or 1',
      },
    },
    professorId: {
      custom: {
        options: (value, { req }) => (req.body.roleId === 2 ? Number.isInteger(value) : true),
        errorMessage: 'For an account with professor role, please indicate which professor it belongs to!',
      },
    },
  };
  if (type === 'CREATE') {
    schema.password = {
      isString: true,
      custom: {
        options: (value) => value.length >= 6,
        errorMessage: 'Password must contain at least 6 characters',
      },
    };
  }
  return checkSchema(schema);
};

export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(403).json({
      errors: errors.array(),
    });
  }
  req.newAccount = {
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
    roleId: req.body.roleId,
    accountStatus: req.body.accountStatus,
    professorId: req.body.professorId,
  };
  if (req.body.password) req.newAccount.password = hashSync(req.body.password, genSaltSync());
  next();
}
