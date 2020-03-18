export const needsPagination = (req) => Object.keys(req.query).indexOf('page') > -1 && Object.keys(req.query).indexOf('size') > -1;

export default (model, include, { page = 1, size = Number.MAX_SAFE_INTEGER }, where, res, next) => {
  const limit = size;
  const offset = (page - 1) * size;
  model.findAll({
    where,
    include,
    limit,
    offset,
  })
    .then((items) => next(items))
    .catch((error) => res.status(502).json(error));
};
