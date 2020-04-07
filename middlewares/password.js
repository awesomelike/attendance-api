import { verify } from 'jsonwebtoken';
import { hashSync, genSaltSync } from 'bcryptjs';

export const confirmResetToken = (req, res, next) => {
  const { token } = req.params;
  verify(token, process.env.JWT_KEY, (error, decoded) => {
    if (error) {
      return res.sendStatus(401);
    }
    res.redirect(`http://localhost:8080/#/reset/user/pwd/${token}`);
  });
};

export default (req, res, next) => {
  const { token } = req.params;
  // eslint-disable-next-line consistent-return
  verify(token, process.env.JWT_KEY, (error, decoded) => {
    if (error) {
      return res.sendStatus(401);
    }
    const { accountId } = decoded;
    req.account = {
      id: accountId,
    };
    req.newPassword = {
      password: hashSync(req.body.password, genSaltSync()),
    };
    next();
  });
};
