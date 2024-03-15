import jwt from "jsonwebtoken";

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
      // Send user id
      req.userId = accessDecoded.id;
      req.userRole = accessDecoded.role;
      next();
    } catch (error) {
      console.log("THE error", error);
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
