import bot from '../config';
import startKeyboard from './keyboards/start';

export default bot.onText(/\/start/, async (msg) => {
  await bot.sendMessage(msg.chat.id, 'Welcome to the IUT Attendance System!');
  await bot.sendMessage(msg.chat.id, 'Please, share your number for authentication: ', {
    reply_markup: {
      one_time_keyboard: true,
      resize_keyboard: true,
      keyboard: startKeyboard,
    },
  });
});
