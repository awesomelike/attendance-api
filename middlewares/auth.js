import { verify } from 'jsonwebtoken';

require('dotenv').config();

const parseToken = (req, res) => {
  const { authorization } = req.headers;
  if (!authorization) return res.status(401).json({ error: 'No token' });
  return authorization.split(' ')[1];
};

export const authAttendance = (req, res, next) => {
  const token = parseToken(req, res);
  verify(token, process.env.JWT_KEY, (error, decoded) => {
    if (error) {
      console.log(error);
      return res.status(401).json(error);
    }
    req.professorRfid = decoded;
    next();
  });
};

export default (req, res, next) => {
  const token = parseToken(req, res);
  verify(token, process.env.JWT_KEY, (error, decoded) => {
    if (error) {
      console.log(error);
      return res.status(401).json(error);
    }
    req.account = decoded;
    next();
  });
};
