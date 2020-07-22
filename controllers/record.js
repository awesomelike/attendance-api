
import models from '../models';
import findWithPagination, { needsPagination } from '../util/pagination';

const { Record } = models;

const include = [
  {
    model: models.ClassItem,
    as: 'classItem',
    include: [
      {
        model: models.Class,
        as: 'class',
        include: [
          {
            model: models.Section,
            as: 'section',
            include: [
              {
                model: models.Professor,
                as: 'professor',
              },
              {
                model: models.Course,
                as: 'course',
              },
            ],
          },
        ],
      },
    ],
  },
];

function find(where, res, next) {
  Record.findAll({
    where,
    include,
  })
    .then((items) => res.status(200).json(items))
    .catch((error) => res.status(502).json(error));
}

export default {
  getAll(req, res) {
    if (needsPagination(req)) {
      findWithPagination(Record, include, {
        page: parseInt(req.query.page, 10),
        size: parseInt(req.query.size, 10),
      }, null, res, (records) => res.status(200).json(records));
    }
  },
  attend(req, res) {
    const recordId = parseInt(req.params.id, 10);
    Record.update({ isAttended: true, attendedAt: Date.now(), rfid: null }, {
      where: {
        id: recordId,
      },
    })
      .then(() => res.status(200).json({ record: { id: recordId, attendedAt: Date.now() } }))
      .catch((error) => res.sendStatus(502).json(error.message));
  },
  unattend(req, res) {
    const recordId = parseInt(req.params.id, 10);
    Record.update({ isAttended: false, attendedAt: null, rfid: null }, {
      where: {
        id: recordId,
      },
    })
      .then(() => res.status(200).json({ record: { id: recordId, attendedAt: null } }))
      .catch((error) => res.sendStatus(502).json(error.message));
  },
};
