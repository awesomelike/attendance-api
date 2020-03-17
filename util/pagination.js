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
