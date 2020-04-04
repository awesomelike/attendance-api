import { verify } from 'jsonwebtoken';

export default (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) return res.sendStatus(401);
  const token = authorization.split(' ')[1];
  verify(token, process.env.JWT_KEY, (error, decoded) => {
    if (error) return res.sendStatus(401);
    req.account = decoded;
    next();
  });
};
