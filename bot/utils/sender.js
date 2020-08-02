import moment from 'moment';
import bot from '../config';

const format = (date) => moment(date).format('HH:mm, DD.MM.YYYY');

export default {
  sendAttendanceMessage(chatId, uid, name, course, sectionNumber, week, plannedDate) {
    return bot.sendMessage(
      chatId,
      `🔔 <strong>ATTENDANCE NOTIFICATION</strong>\n\n<strong>Course: </strong>${course}\n<strong>Section: </strong>${sectionNumber}\n<strong>ID: </strong>${uid}\n<strong>Name: </strong>${name}\n<strong>Week: </strong>${week}\n<strong>Class date: </strong>${format(plannedDate)}\n<strong>Check-in time: </strong>${format(new Date())}\n<strong>Marked: </strong>Present ✅\n`,
      {
        parse_mode: 'HTML',
      },
    );
  },
};
