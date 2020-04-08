import models from '../models';

const { Account } = models;

const options = {
  include: [
    {
      model: models.Professor,
      as: 'professor',
    },
    {
      model: models.Role,
      as: 'role',
    },
  ],
};

export default {
  getAll(_, res) {
    Account.findAll(options)
      .then((accounts) => res.status(200).json(accounts))
      .catch((error) => res.status(502).json(error));
  },
  get(req, res) {
    Account.findByPk(req.params.id, options)
      .then((account) => res.status(200).json(account))
      .catch((error) => res.status(502).json(error));
  },
  async create(req, res) {
    try {
      const account = await Account.create({
        username: req.newAccount.username,
        password: req.newAccount.password,
        name: req.newAccount.name,
        email: req.newAccount.email,
        roleId: req.newAccount.roleId,
        accountStatus: req.newAccount.accountStatus,
      });

      if (req.newAccount.professorId) {
        await models.Professor.update({
          accountId: account.id,
        }, {
          where: {
            id: req.newAccount.professorId,
          },
        });
      }
      const createdAccount = await Account.findByPk(account.id, options);
      res.status(200).json(createdAccount);
    } catch (error) {
      console.log(error);
      res.status(502).json(error);
    }
  },
  update(req, res) {
    Account.update(req.newAccount, { where: { id: req.params.id } })
      .then(() => res.sendStatus(200))
      .catch((error) => res.status(502).json(error));
  },
};
