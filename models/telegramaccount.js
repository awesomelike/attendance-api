module.exports = (sequelize, DataTypes) => {
  const TelegramAccount = sequelize.define('TelegramAccount', {
    studentId: DataTypes.INTEGER,
    phoneNumber: DataTypes.STRING,
    chatId: DataTypes.INTEGER,
    username: DataTypes.STRING,
  }, {});
  TelegramAccount.associate = (models) => {
    TelegramAccount.belongsTo(models.Student, { as: 'student', foreignKey: 'studentId' });
  };
  return TelegramAccount;
};
