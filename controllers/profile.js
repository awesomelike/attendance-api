import { sign } from 'jsonwebtoken';
import models from '../models';
import { sendEmail, passwordReset } from '../tasks/email';
import { options as makeupOptions } from './makeup';

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
          attributes: ['id', 'name'],
          include: [
            {
              model: models.Permission,
              as: 'permissions',
              attributes: ['id', 'name'],
              through: { attributes: [] },
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
      res.status(502).json(error.message);
    }
  },
  getMakeups(req, res) {
    models.Professor.findByPk(req.account.professorId, {
      include: [
        {
          model: models.Makeup,
          as: 'makeups',
          include: makeupOptions.include,
        },
      ],
    })
      .then((result) => res.status(200).json(result.makeups))
      .catch((error) => { console.log(error); res.status(502).json(error.message); });
  },
  updateProfile(req, res) {
    Account.update(req.validatedAccount, { where: { id: req.account.id } })
      .then(() => res.sendStatus(200))
      .catch((error) => res.status(502).json(error));
  },
  updatePassword(req, res) {
    Account.update(req.newPassword, { where: { id: req.account.id } })
      .then(() => res.sendStatus(200))
      .catch((error) => res.status(502).json(error));
  },
  async sendPasswordResetEmail(req, res) {
    const { email } = req.body;
    const account = await models.Account.findOne({ where: { email } });
    if (!account) {
      return res.status(404).json({ error: 'No confirmed user with this email' });
    }
    sign({ accountId: account.id },
      process.env.JWT_KEY, {
        expiresIn: '10m',
      }, (error, token) => {
        if (error) {
          return res.sendStatus(500);
        }
        sendEmail(passwordReset(email, account.name, token))
          .then(() => res.status(200).json({ message: 'Check your email for the password reset link' }))
          .catch((emailError) => { console.log(emailError); res.status(502).json(emailError); });
      });
  },
};
