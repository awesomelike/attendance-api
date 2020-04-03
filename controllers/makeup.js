import models from '../models';

const { Makeup } = models;

export default {
  getAll(_, res) {
    Makeup.findAll()
      .then((makeups) => res.status(200).json(makeups))
      .catch((error) => res.status(502).json(error));
  },
  get(req, res) {
    Makeup.findByPk(req.params.id)
      .then((makeup) => res.status(200).json(makeup))
      .catch((error) => res.status(502).json(error));
  },
};
