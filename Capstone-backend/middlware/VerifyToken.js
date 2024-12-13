const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const openRoutes = [
    "/login",
    "/logout",
    "/register",
    "/users/create",
    "/auth/google",
    "/auth/google/callback",
  ];

  if (openRoutes.includes(req.path)) {
    return next();
  }

  const authHeader = req.header("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).send({
      statusCode: 401,
      message: "Token not provided",
    });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    return res.status(403).send({
      statusCode: 403,
      message:
        error.message === "jwt expired" ? "Token expired" : "Token not valid",
    });
  }
};