import models from '../models';

const { WeekDay } = models;

export default {
  async getAll(req, res) {
    try {
      const weekdays = await WeekDay.findAll({
        attributes: ['id', 'key', 'name'],
      });
      res.status(200).json(weekdays);
    } catch (error) {
      console.log(error);
      res.status(502).json(error);
    }
  },
};
