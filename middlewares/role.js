import allRoles from '../data/seed/roles';

export default (roles) => (req, res, next) => {
  if (req.professorRfid) return next();
  const { roleId } = req.account;
  const roleName = Object.entries(allRoles).find((element) => element[1].id === roleId)[1].name;
  const roleIds = Object.entries(roles).map((element) => element[1].id);
  if (roleIds.includes(roleId)) {
    return next();
  }
  return res.status(403).json({
    error: `Access denied for role ${roleName} at ${req.method}${req.originalUrl}`,
  });
};
