import models from '../models';

const { Account } = models;

export default {
  async getProfile(req, res) {
    try {
      const options = {};
      options.attributes = ['id', 'username', 'name', 'email', 'roleId'];
      options.include = [
        {
          model: models.Role,
          as: 'role',
          include: [
            {
              model: models.Permission,
              as: 'permissions',
              attributes: ['id', 'name'],
            },
          ],
        },
      ];
      if (req.account.professorId) {
        options.include.push({
          model: models.Professor,
          as: 'professor',
        });
      }
      const account = await Account.findByPk(req.account.id, options);
      res.status(200).json(account);
    } catch (error) {
      res.status(502).json(error);
    }
  },
};
