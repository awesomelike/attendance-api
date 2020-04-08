import { verify } from 'jsonwebtoken';

export default (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) return res.status(401).json('No token');
  const token = authorization.split(' ')[1];
  verify(token, process.env.JWT_KEY, (error, decoded) => {
    if (error) {
      console.log(error);
      return res.status(401).json(error);
    }
    req.account = decoded;
    next();
  });
};
