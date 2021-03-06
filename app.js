import createError from 'http-errors';
import express, { json, urlencoded } from 'express';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import logger from 'morgan';
import json2xls from 'json2xls';
import socketIO from 'socket.io';
import { createServer } from 'http';
import authSocket from 'socketio-auth';
import fileUpload from 'express-fileupload';
import { socketAuth } from './middlewares/auth';
import indexRouter from './routes/index';
// import './bot/bot';

require('dotenv').config();
require('./tasks/backup');
require('./tasks/class');

const app = express();

const server = createServer(app);
const io = socketIO(server);
io.origins('*:*');
authSocket(io, { authenticate: socketAuth });

// view engine setup
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(json({ limit: '10mb' }));
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(fileUpload({ limits: { fileSize: 5 * 1024 * 1024 }, abortOnLimit: true }));
app.use(json2xls.middleware);
app.use(cors());
app.use(express.static(join(__dirname, 'public')));
app.use('/assets', express.static(join(__dirname, 'assets')));
app.use('/storage', express.static(join(__dirname, 'storage')));
app.use(express.static(join(__dirname, '../academic_affairs_client/dist')));

// Append Socket.IO to the res object
app.use((req, res, next) => {
  res.io = io;
  next();
});

indexRouter(app);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export { app as default, server };
