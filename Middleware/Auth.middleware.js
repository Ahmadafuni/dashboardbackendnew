import jwt from "jsonwebtoken";
import prisma from "../client.js";

export const verifyUser = (roles) => {
  return async (req, res, next) => {
    // Tokens
    const Token = req.headers["authorization"];
    try {
      if (!Token) {
        return res.status(403).send({
          status: 403,
          message:
            "You are nor permitted to take this action or your session expired. Please login!",
          data: {},
        });
      }
      const accessToken = Token.split(" ")[1];
      const accessDecoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN);

      const roleMatchedAccess = roles.includes(accessDecoded.role);

      // Check Authorization
      if (!roleMatchedAccess) {
        return res.status(403).send({
          status: 403,
          message:
            "You are nor permitted to take this action or your session expired. Please login!",
          data: {},
        });
      }

      const user = await prisma.users.findUnique({
        where: {
          Id: +accessDecoded.id,
          Audit: { IsDeleted: false },
        },
        include: {
          Department: true,
        },
      });
      // Send user id
      req.userId = user.Id;
      req.userRole = user.Department.Category;
      req.userDepartmentId = user.DepartmentId;
      next();
    } catch (error) {
      if (
        error instanceof jwt.JsonWebTokenError ||
        error instanceof jwt.TokenExpiredError ||
        error instanceof jwt.NotBeforeError
      ) {
        return res.status(403).send({
          status: 403,
          message:
            "You are nor permitted to take this action or your session expired. Please login!",
          data: {},
        });
      }
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  };
};
