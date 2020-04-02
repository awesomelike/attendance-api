import moment from 'moment';
import bot from '../config';

export default {
  sendAttendanceMessage(chatId, uid, name, course, sectionNumber, week, date) {
    return new Promise((resolve, reject) => {
      bot.sendMessage(
        chatId,
        `🔔 <strong>ATTENDANCE NOTIFICATION</strong>\n\n<strong>Course: </strong>${course}\n<strong>Section: </strong>${sectionNumber}\n<strong>ID: </strong>${uid}\n<strong>Name: </strong>${name}\n<strong>Week: </strong>${week}\n<strong>Class date: </strong>${moment(date).format('MMMM DD, HH:mm')}\n<strong>Check-in time: </strong>${moment(new Date(2019, 8, 23, 10, 34, 2)).format('MMMM DD, HH:mm')}\n<strong>Marked: </strong>Present ✅\n`,
        {
          parse_mode: 'HTML',
        },
      )
        .then((message) => resolve(message))
        .catch((error) => reject(error));
    });
  },
};
