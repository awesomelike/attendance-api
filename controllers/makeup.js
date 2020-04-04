import models from '../models';

const { Makeup } = models;

export default {
  getAll(_, res) {
    Makeup.findAll()
      .then((makeups) => res.status(200).json(makeups))
      .catch((error) => res.status(502).json(error));
  },
  get(req, res) {
    console.log('GETTTTING MAKE UP');
    Makeup.findByPk(req.params.id)
      .then((makeup) => res.status(200).json(makeup))
      .catch((error) => res.status(502).json(error));
  },
  create(req, res) {
    Makeup.create(req.makeup)
      .then((makeup) => res.status(200).json(makeup))
      .catch((error) => res.status(502).json(error));
  },
  update(req, res) {
    Makeup.update(req.makeup, { where: { id: req.params.id } })
      .then(() => res.sendStatus(200))
      .catch((error) => res.status(502).json(error));
  },
  resolve(req, res) {
    Makeup.update({
      ...req.makeup,
      resolvedAt: (new Date()).getTime(),
    }, { where: { id: req.params.id } })
      .then(() => res.sendStatus(200))
      .catch((error) => res.status(502).json(error));
  },
};
