import bot from '../config';
import models from '../../models';

export default bot.onText(/\/myattendance/, async (msg) => {
  const telegramAccount = await models.TelegramAccount.findOne({
    where: {
      chatId: msg.chat.id,
    },
    include: [
      {
        model: models.Student,
        as: 'student',
        include: [
          {
            model: models.Section,
            as: 'sections',
            through: {
              attributes: [],
            },
            include: [
              {
                model: models.Course,
                as: 'course',
              },
            ],
          },
        ],
      },
    ],
  });

  bot.sendMessage(msg.chat.id, 'Choose a course: ', {
    reply_markup: {
      inline_keyboard: telegramAccount.student.sections.map(({ course }) => [{
        text: course.name,
        callback_data: JSON.stringify({
          action: 'course',
          courseId: course.id,
          studentId: telegramAccount.student.id,
        }),
      }]),
    },
  });
});
