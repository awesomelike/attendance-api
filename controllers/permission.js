import models from '../models';

const { Permission } = models;

const options = {
  attributes: ['id', 'name'],
  include: [
    {
      model: models.Role,
      as: 'roles',
      attributes: ['id', 'name'],
      through: { attributes: [] },
    },
  ],
};

export default {
  async getAll(_, res) {
    try {
      const permissions = await Permission.findAll(options);
      res.status(200).json(permissions);
    } catch (error) {
      res.status(502).json(error);
    }
  },
};
