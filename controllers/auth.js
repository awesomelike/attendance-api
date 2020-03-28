import { sign } from 'jsonwebtoken';
import { compareSync } from 'bcryptjs';
import models from '../models';

async function findAccount(where, res, next) {
  try {
    const account = await models.Account.findOne({
      where,
      include: [
        {
          model: models.Role,
          as: 'role',
          attributes: ['id', 'name'],
        },
      ],
    });
    if (account) {
      next(account);
    } else res.sendStatus(404);
  } catch (error) {
    res.status(502).json(error);
  }
}

export default {
  login(req, res) {
    findAccount({ username: req.body.username }, res, (account) => {
      if (compareSync(req.body.password, account.password)) {
        sign({
          accountId: account.id,
          roleId: account.role.id,
        },
        process.env.JWT_KEY, { expiresIn: '2h' },
        (error, token) => {
          if (error) return res.status(502).json(error);
          return res.status(200).json({ token });
        });
      } else res.sendStatus(401);
    });
  },
};
