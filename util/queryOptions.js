import { Op } from 'sequelize';

export default (req, {
  include,
  likeProps = [],
  ignoreProps = [],
  order = [['updatedAt', 'DESC']],
  attributes = null,
}) => {
  const options = { include, order, attributes };
  const where = {};

  Object.keys(req.query).forEach((key) => {
    if (!ignoreProps.includes(key) && req.query[key] !== '') {
      if (likeProps.includes(key)) {
        where[key] = { [Op.like]: `%${req.query[key]}%` };
      } else where[key] = parseInt(req.query[key], 10);
    }
  });

  if (where.page) delete where.page;
  if (where.size) delete where.size;

  options.where = where;

  if (req.query.size) options.limit = parseInt(req.query.size, 10);
  if (req.query.page) options.offset = parseInt((req.query.page - 1) * options.limit, 10);

  return options;
};
