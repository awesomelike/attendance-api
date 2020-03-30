import models from '../models';

const { Room } = models;

export default {
  getAll(_, res) {
    Room.findAll({
      attributes: ['id', 'label'],
    })
      .then((rooms) => res.status(200).json(rooms))
      .catch((error) => res.status(502).json(error));
  },
};
