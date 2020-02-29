import models from '../models';

function find(where, res, next) {
  models.Professor.findAll({
    where,
    include: [{
      model: models.Section,
      as: 'sections',
    }],
    exclude: ['password'],
  })
    .then((items) => next(items))
    .catch((error) => res.status(502).json(error));
}

export default {
  getAll(req, res) {
    find(null, res, (professors) => res.status(200).json(professors));
  },
  get(req, res) {
    models.Professor.findByPk(req.params.id)
      .then((professor) => res.status(200).json(professor));
  },
};
