import { checkSchema, validationResult } from 'express-validator/check';
import moment from 'moment';
import { isTaughtBy } from '../../controllers/classItem';
import { CREATE, RESOLVE } from '../../constants/makeup';

export const check = (method) => {
  const schema = {
    classItemId: {
      isInt: true,
    },
    newDate: {
      isInt: true,
      custom: {
        options: (value) => value > (new Date()).getTime(),
        errorMessage: 'You can not set makeups to the past!',
      },
    },
    roomId: {
      isInt: true,
    },
    timeSlots: {
      isArray: true,
    },
  };
  if (method === CREATE) {
    schema.classItemId.custom = {
      options: async (value, { req }) => {
        const isItemValid = await isTaughtBy(value, req.account.professorId);
        return !!req.account.professorId && isItemValid;
      },
      errorMessage: 'You are not authorized to request makeup for this class!',
    };
  }
  if (method === RESOLVE) {
    Object.assign(schema, {
      makeupStatusId: {
        isInt: true,
      },
      resolvedById: {
        isInt: true,
        custom: {
          options: (value, { req }) => value === req.account.id,
        },
      },
    });
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
  req.makeup = {
    classItemId: req.body.classItemId,
    newDate: moment(req.body.newDate).startOf('day'),
    roomId: req.body.roomId,
    makeupStatusId: req.body.makeupStatusId,
    resolvedById: req.body.resolvedById,
    timeSlots: req.body.timeSlots,
  };
  next();
}
