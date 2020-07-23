import { verify } from 'jsonwebtoken';

require('dotenv').config();

export const socketAuth = async (socket, data, callback) => {
  const { token } = data;
  verify(token, process.env.JWT_KEY, (error, decoded) => {
    if (error) {
      console.log(error);
      return callback(new Error('Invalid'));
    }
    console.log(decoded);
    if (decoded.roleId) {
      switch (decoded.roleId) {
        case 1:
          socket.join('AFFAIRS');
          break;
        case 2:
          socket.join('PROFESSORS');
          break;
        default:
          break;
      }
      console.log('authenticated');
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
