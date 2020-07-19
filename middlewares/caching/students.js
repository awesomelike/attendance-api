import cache from '../../cache';

export default (req, res, next) => {
  const { currentSection: { students } } = req.classAndSection;
  students.forEach((student) => {
    cache.set(student.rfid, {
      id: student.id,
      sections: student.sections.map(({ id }) => id),
    });
  });
};
