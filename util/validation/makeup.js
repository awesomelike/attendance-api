import { checkSchema, validationResult } from 'express-validator/check';
import moment from 'moment';
import { isTaughtBy } from '../../controllers/classItem';
import { CREATE, RESOLVE } from '../../constants/types';
import { getAvailableRooms } from '../../controllers/room';

const isTimeslotArrayValid = (array) => {
  const areIntegers = array.filter((element) => Number.isInteger(element));
  if (areIntegers.length !== array.length) return false;

  for (let index = 0; index < array.length - 1; index += 1) {
    const element = array[index];
    if (element !== array[index + 1] - 1) {
      return false;
    }
  }
  return true;
};

export const check = (method) => {
  let schema = {};
  if (method === RESOLVE) {
    schema = {
      makeupStatusId: {
        isInt: true,
        custom: {
          options: (value) => [2, 3].includes(value),
          errorMessage: 'Invalid makeupStatusId, you should either accept or reject',
        },
      },
    };
  } else {
    schema = {
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
        custom: {
          options: (array) => isTimeslotArrayValid(array),
          errorMessage: 'Invalid timeSlots array',
        },
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
    newDate: moment(req.body.newDate).startOf('day').valueOf(),
    roomId: parseInt(req.body.roomId, 10),
    makeupStatusId: parseInt(req.body.makeupStatusId, 10),
    resolvedById: parseInt(req.body.resolvedById, 10),
    timeSlots: req.body.timeSlots,
  };
  next();
}


export const isRoomFree = async (req, res, next) => {
  const { newDate, timeSlots } = req.makeup;
  const availableRooms = await getAvailableRooms(newDate, timeSlots);
  if (availableRooms.map(({ id }) => id).includes(req.makeup.roomId)) {
    return next();
  }
  res.status(403).json({ error: 'Room is already reserved' });
};
