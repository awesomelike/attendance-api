import cache from '../../cache';

export default (req, res, next) => {
  const { currentSection: { students } } = req.classAndSection;
  students.forEach(({
    rfid, id: studentId, uid, name, sections,
  }) => {
    cache.set(rfid, {
      id: studentId,
      uid,
      name,
      sections: sections.map(({ id }) => id),
    });
  });
};
