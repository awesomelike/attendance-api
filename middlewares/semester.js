import { Semester } from '../models';

const getSemesterId = async (req, res, next) => {
  try {
    let semesterId = parseInt(req.query.semesterId, 10);
    if (!semesterId) {
      const semesters = await Semester.findAll({
        attributes: ['id'],
        order: [['id', 'DESC']],
        limit: 1,
      });
      if (!semesters.length) {
        return res.status(404).json({ error: 'There is no semester yet!' });
      }
      if (semesters[0]) {
        semesterId = semesters[0].id;
        req.semesterId = semesterId;
        next();
      } else {
        return res.status(404).json({ error: 'There is no semester yet!' });
      }
    } else {
      req.semesterId = semesterId;
      next();
    }
  } catch (error) {
    console.log(error);
  }
};

export { getSemesterId as default };
