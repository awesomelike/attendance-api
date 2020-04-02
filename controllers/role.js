import models from '../models';

const { Role } = models;

const options = {
  attributes: ['id', 'name'],
  include: [
    {
      model: models.Permission,
      as: 'permissions',
      attributes: ['id', 'name'],
      through: {
        attributes: [],
      },
    },
  ],
};

export default {
  getAll(_, res) {
    Role.findAll(options)
      .then((roles) => res.status(200).json(roles))
      .catch((error) => res.status(502).json(error));
  },
  get(req, res) {
    Role.findByPk(req.params.id, options)
      .then((role) => res.status(200).json(role))
      .catch((error) => res.status(502).json(error));
  },
  create(req, res) {
    Role.create({
      name: req.body.name,
    })
      .then((role) => res.status(200).json(role))
      .catch((error) => res.status(502).json(error));
  },
  async update(req, res) {
    try {
      const role = await Role.findByPk(req.params.id);
      await role.setPermissions(req.role.permissions);
      res.sendStatus(200);
    } catch (error) {
      res.status(502).json(error);
    }
  },
};
