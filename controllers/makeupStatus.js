import models from '../models';

const { MakeupStatus } = models;

export default {
  getAll(_, res) {
    MakeupStatus.findAll({
      attributes: ['id', 'name'],
    })
      .then((makeupStatuses) => res.status(200).json(makeupStatuses))
      .catch((error) => res.status(502).json(error));
  },
};
