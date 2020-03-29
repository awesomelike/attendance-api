import models from '../models';

const { WeekDay } = models;

export default {
  getAll(req, res) {
    WeekDay.findAll({
      attributes: ['id', 'key', 'name'],
    })
      .then((weekdays) => res.status(200).json(weekdays))
      .catch((error) => res.status(502).json(error));
  },
};
