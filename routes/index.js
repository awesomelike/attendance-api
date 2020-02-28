import users from './users';

export default (app) => {
  app.use('/api/users', users);
};
