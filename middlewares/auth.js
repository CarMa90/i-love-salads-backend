const jwt = require("jsonwebtoken");
require("dotenv").config();
const { getUserInfo } = require("../controllers/users");
const ForbiddenError = require("../errors/forbidden-err");

const { JWT_SECRET, NODE_ENV } = process.env;

module.exports.auth = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).send({ message: "Se requiere autorización" });
  }

  const token = authorization.replace("Bearer ", "");
  let payload;

  try {
    payload = jwt.verify(
      token,
      NODE_ENV === "production" ? JWT_SECRET : "dev-secret",
    );
  } catch {
    return res.status(401).send({ message: "Se requiere autorización" });
  }

  req.user = payload;

  next();
};

module.exports.adminAuth = (req, res, next) => {
  console.log(req.user);
  if (!req.user) {
    return next(
      new ForbiddenError("Acceso no autorizado: Usuario no identificado"),
    );
  }

  if (req.user.userType !== "admin") {
    return next(
      new ForbiddenError(
        "Acceso denegado: Se requieren permisos de administrador",
      ),
    );
  }

  next();
};
