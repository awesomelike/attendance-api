import models from '../models';

const { MakeupStatus } = models;

export default {
  async getAll(_, res) {
    try {
      const makeupStatuses = await MakeupStatus.findAll({
        attributes: ['id', 'name'],
      });
      res.status(200).json(makeupStatuses);
    } catch (error) {
      res.status(502).json(error);
    }
  },
};
