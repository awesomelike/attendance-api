import { Op } from 'sequelize';
import bot from '../config';
import models from '../../models';

export default bot.on('contact', async (msg) => {
  try {
    const telegramAccount = await models.TelegramAccount.findOne({
      where: {
        phoneNumber: {
          [Op.like]: `%${msg.contact.phone_number}%`,
        },
      },
      include: [
        {
          model: models.Student,
          as: 'student',
        },
      ],
    });
    if (!telegramAccount) {
      return bot.sendMessage(msg.chat.id, '❌ Sorry, I cannot recognize this phone number as IUT Student!');
    }

    if (!telegramAccount.chatId) {
      await telegramAccount.update({ chatId: msg.chat.id, username: msg.chat.username });
      await bot.sendMessage(
        msg.chat.id,
        `✅ This account has been successfully linked to: \n<strong>ID: </strong>${telegramAccount.student.uid}\n<strong>Name: </strong>${telegramAccount.student.name}`, {
          parse_mode: 'HTML',
        },
      );
    }
  } catch (error) {
    bot.sendMessage(msg.chat.id, `Server error: ${error}`);
  }
});
