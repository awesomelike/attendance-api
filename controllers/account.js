import models from '../models';
import { ASSISTANT } from '../data/seed/roles';

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
    {
      model: models.Assistant,
      as: 'assistant',
      include: [
        {
          model: models.Professor,
          as: 'professor',
        },
      ],
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
        if (req.newAccount.roleId === ASSISTANT.id) {
          await models.Assistant.create({
            accountId: account.id,
            professorId: req.newAccount.professorId,
          });
        } else {
          await models.Professor.update({
            accountId: account.id,
          }, {
            where: { id: req.newAccount.professorId },
          });
        }
      }
      const createdAccount = await Account.findByPk(account.id, options);
      res.status(200).json(createdAccount);
    } catch (error) {
      console.log(error);
      res.status(502).json(error.message);
    }
  },
  async update(req, res) {
    try {
      const accountId = req.params.id;
      await Account.update(req.newAccount, { where: { id: req.params.id } });
      if (req.newAccount.professorId) {
        if (req.newAccount.roleId === ASSISTANT.id) {
          await models.Assistant.update({ professorId: req.newAccount.professorId }, {
            where: { accountId },
          });
        } else {
          await models.Professor.update({ accountId }, {
            where: { id: req.newAccount.professorId },
          });
        }
      }
      res.sendStatus(200);
    } catch (error) {
      res.status(502).json(error);
    }
  },
};
