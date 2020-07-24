import { verify } from 'jsonwebtoken';
import rooms from '../constants/socket';

require('dotenv').config();

const path = (req) => req.originalUrl.split('/').slice(-1)[0];

export const socketAuth = async (socket, data, callback) => {
  const { token } = data;
  verify(token, process.env.JWT_KEY, (error, decoded) => {
    if (error) {
      console.log(error);
      return callback(new Error('Invalid'));
    }
    if (decoded.roleId) {
      switch (decoded.roleId) {
        case 1:
          socket.join(rooms.AFFAIRS);
          break;
        case 2:
          socket.join(rooms.PROFESSORS);
          break;
        default:
          break;
      }
      return callback(null, !!decoded);
    }
  });
};


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
    if (path(req) === 'verifyToken') {
      res.sendStatus(200);
    } else {
      next();
    }
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
