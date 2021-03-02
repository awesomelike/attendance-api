import models, { sequelize } from '../models';
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
  async getAll(_, res) {
    try {
      const accounts = await Account.findAll(options);
      res.status(200).json(accounts);
    } catch (error) {
      res.status(502).json(error);
    }
  },
  async get(req, res) {
    try {
      const account = await Account.findByPk(req.params.id, options);
      res.status(200).json(account);
    } catch (error) {
      res.status(502).json(error);
    }
  },
  async create(req, res) {
    let t;
    try {
      t = await sequelize.transaction();
      const account = await Account.create({
        username: req.newAccount.username,
        password: req.newAccount.password,
        name: req.newAccount.name,
        email: req.newAccount.email,
        roleId: req.newAccount.roleId,
        accountStatus: req.newAccount.accountStatus,
      }, {
        transaction: t,
      });

      if (req.newAccount.professorId) {
        if (req.newAccount.roleId === ASSISTANT.id) {
          await models.Assistant.create({
            accountId: account.id,
            professorId: req.newAccount.professorId,
          }, {
            transaction: t,
          });
        } else {
          await models.Professor.update({
            accountId: account.id,
          }, {
            where: { id: req.newAccount.professorId },
            transaction: t,
          });
        }
      }

      await t.commit();

      const createdAccount = await Account.findByPk(account.id, options);
      res.status(200).json(createdAccount);
    } catch (error) {
      await t.rollback();
      res.status(502).json(error.message);
    }
  },
  async update(req, res) {
    let t;
    try {
      const accountId = req.params.id;

      t = await sequelize.transaction();
      await Account.update(req.newAccount, { where: { id: req.params.id }, transaction: t });
      if (req.newAccount.professorId) {
        if (req.newAccount.roleId === ASSISTANT.id) {
          await models.Assistant.update({ professorId: req.newAccount.professorId }, {
            where: { accountId },
            transaction: t,
          });
        } else {
          await models.Professor.update({ accountId }, {
            where: { id: req.newAccount.professorId },
            transaction: t,
          });
        }
      }
      await t.commit();

      res.sendStatus(200);
    } catch (error) {
      await t.rollback();
      res.status(502).json(error);
    }
  },
};
