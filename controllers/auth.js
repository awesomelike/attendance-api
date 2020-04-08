import { sign } from 'jsonwebtoken';
import { compareSync } from 'bcryptjs';
import models from '../models';

async function findAccount(where, res, next) {
  try {
    const account = await models.Account.findOne({
      where,
      attributes: ['id', 'username', 'password', 'roleId'],
      include: [
        {
          model: models.Role,
          as: 'role',
          attributes: ['id', 'name'],
        },
        {
          model: models.Professor,
          as: 'professor',
          attributes: ['id'],
          required: false,
        },
      ],
    }, { raw: true });
    if (account) {
      next(account);
    } else res.status(401).json({ error: 'Invalid login or password' });
  } catch (error) {
    console.log(error);
    res.status(502).json(error);
  }
}

export default {
  login(req, res) {
    findAccount({ username: req.body.username }, res, (account) => {
      const toEncode = {
        id: account.id,
        roleId: account.role.id,
      };

      if (account.professor) toEncode.professorId = account.professor.id;

      if (compareSync(req.body.password, account.password)) {
        sign(toEncode, process.env.JWT_KEY, { expiresIn: '2h' },
          (error, token) => {
            if (error) return res.status(502).json(error);
            return res.status(200).json({ token });
          });
      } else {
        console.log('inside auth controller');
        res.sendStatus(401);
      }
    });
  },
};
