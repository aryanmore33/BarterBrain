const { RES_LOCALS } = require("./middleware/constant");
const { ACCESS_ROLES } = require("../businessLogic/accessmanagement/roleConstants");
const AccessPermissionError = require("../errorHandlers/AccessPermissionError");

const appWrapper = (handler, allowedRoles = []) => {
  return async (req, res, next) => {
    try {

      // Role check (skip for now if empty)
      if (allowedRoles.length && !allowedRoles.includes(ACCESS_ROLES.ALL)) {
        const userInfo = res.locals[RES_LOCALS?.USER_INFO?.KEY || "userInfo"];

        if (!userInfo || !userInfo.roles) {
          throw new AccessPermissionError("Authentication required");
        }

        const hasRole = userInfo.roles.some(role =>
          allowedRoles.includes(role.role_name) || allowedRoles.includes(role.name)
        );

        if (!hasRole) {
          throw new AccessPermissionError("Insufficient permissions");
        }
      }

      // ✅ CAPTURE response
      const response = await handler(req, res, next);

      // ✅ SEND response
      if (!res.headersSent) {
        res.json(response);
      }

    } catch (err) {
      next(err);
    }
  };
};

module.exports = { appWrapper };