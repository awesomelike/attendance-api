export default (roles) => (req, res, next) => {
  const { roleId } = req.account;
  const roleName = Object.entries(roles).find((element) => element[1].id === roleId)[1].name;
  const roleIds = Object.entries(roles).map((element) => element[1].id);
  if (roleIds.includes(roleId)) {
    next();
  } else {
    res.status(403).json({
      error: `Access denied for role ${roleName} at ${req.method}${req.originalUrl}`,
    });
  }
};
