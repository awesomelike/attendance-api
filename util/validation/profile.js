import { checkSchema, validationResult } from 'express-validator/check';
import { compareSync, hashSync, genSaltSync } from 'bcryptjs';
import models from '../../models';

const checkCurrentPassword = async (id, value) => compareSync(value, (await models.Account.findByPk(id, { attributes: ['password'] })).password);

export const check = checkSchema({
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
});

export const checkPassword = checkSchema({
  currentPassword: {
    isString: true,
    custom: {
      options: (currentPassword, { req }) => checkCurrentPassword(req.account.id, currentPassword),
      errorMessage: 'Invalid current password',
    },
  },
  newPassword: {
    isString: true,
  },
});

export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(403).json({
      errors: errors.array(),
    });
  }
  req.validatedAccount = {
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
    roleId: req.body.roleId,
  };
  next();
}

export function validatePassword(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(403).json({
      errors: errors.array(),
    });
  }
  req.newPassword = {
    password: hashSync(req.body.newPassword, genSaltSync()),
  };
  next();
}
