import models from '../models';

const { Role } = models;

const options = {
  attributes: ['id', 'name'],
  include: [
    {
      model: models.Permission,
      as: 'permissions',
      attributes: ['id', 'name'],
      through: { attributes: [] },
    },
  ],
};

export default {
  async getAll(_, res) {
    try {
      const roles = await Role.findAll(options);
      res.status(200).json(roles);
    } catch (error) {
      console.log(error);
      res.status(502).json(error);
    }
  },
  async get(req, res) {
    try {
      const role = await Role.findByPk(req.params.id, options);
      res.status(200).json(role);
    } catch (error) {
      console.log(error);
      res.status(502).json(error);
    }
  },
  async create(req, res) {
    try {
      const role = await Role.create({ name: req.body.name });
      res.status(200).json(role);
    } catch (error) {
      console.log(error);
      res.status(502).json(error);
    }
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
