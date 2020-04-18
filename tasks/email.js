import { createTransport } from 'nodemailer';

require('dotenv').config();

const transporter = createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.GMAIL,
    pass: process.env.GMAIL_PASSWORD,
  },
});

const sendEmail = (options) => new Promise((resolve, reject) => {
  transporter.sendMail(options)
    .then((data) => resolve(data))
    .catch((error) => { reject(error); });
});

const confirmation = (email, name, verificationToken) => ({
  from: process.env.GMAIL,
  to: email,
  subject: 'Confirm your email for IUT Attendance Management System',
  html: `<div style="display: flex; justify-content: center;"> <div style="text-align:center;"> <strong style="font-family: 'Arial';">Dear ${name}</strong>, <br> <p style="font-family: 'Arial';">Confirm your email by clicking the following link: </p> <br> <a style="text-decoration: none; color: #fff; background-color: #398AD7; padding: 10px; box-shadow: 10px 10px 35px -9px rgba(57,138,215,1); font-family: 'Arial';" href="${process.env.BASE_URL}/api/auth/confirmEmail/${verificationToken}">Verify email</a> <br><br><br> <p style="font-family: 'Arial'; font-size:100;">If you think this is by mistake, simply ignore this. </p><br> </div> </div>`,
});

const passwordReset = (email, name, token) => ({
  from: process.env.GMAIL,
  to: email,
  subject: 'Reset your password for IUT Attendance Management System',
  html: `<div style="display: flex; justify-content: center;"> <div style="text-align:center;"> <strong style="font-family: 'Arial';">Dear ${name}</strong>, <br> <p style="font-family: 'Arial';">You can reset your password using this link: </p> <br> <a style="text-decoration: none; color: #fff; background-color: #398AD7; padding: 10px; box-shadow: 10px 10px 35px -9px rgba(57,138,215,1); font-family: 'Arial';" href="${process.env.BASE_URL}/api/auth/resetPassword/${token}">Reset password</a> <br><br><br> <p style="font-family: 'Arial'; font-size:100;">If you think this is by mistake, simply ignore this. </p><br> </div> </div>`,
});

const missedClassesNotification = (email, name, course, count) => ({
  from: process.env.GMAIL,
  to: email,
  subject: `Attendance attention required! Course:${course}`,
  html: `<div style="display: flex; justify-content: center;"><div style="text-align:center;"><p style="font-family: 'Arial'; background-color: #FF4136; color: white; border-radius: 10px; padding: 10px; font-weight: bold">ATTENTION REQUIRED</p> <strong style="font-family: 'Arial';">Dear ${name}</strong>, <br><p style="font-family: 'Arial';">Please be notified that, you have missed <span style="font-weight: bold">${count}</span> classes from <span style="font-weight: bold">${course}</span>.</p><br><p style="font-family: 'Arial'; font-size:100;">With best regards, IUT Attendance Management System </p><br> </div> </div>`,
});

export {
  sendEmail,
  confirmation,
  passwordReset,
  missedClassesNotification,
};
