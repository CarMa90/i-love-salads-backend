const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const BadRequestError = require("../errors/bad-request-err");
const ConflictError = require("../errors/conflict-err");
const UnauthorizedError = require("../errors/unauthorized-err");
require("dotenv").config();

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch((err) => next(err));
};

module.exports.createUser = (req, res, next) => {
  const { email, password, name, userType, mobile } = req.body;

  if (!password) {
    return next(new BadRequestError("El password es obligatorio"));
  }

  if (password.length < 8) {
    return next(
      new BadRequestError("El password debe tener al menos 8 caracteres"),
    );
  }

  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  if (!regex.test(password)) {
    return next(
      new BadRequestError(
        "El password debe contener al menos una mayúscula, una minúscula, un número y un caracter especial",
      ),
    );
  }

  if (!mobile) {
    return next(new BadRequestError("El celular es obligatorio"));
  }

  bcrypt
    .hash(password, 10)
    .then((hash) => {
      return User.create({
        email,
        name,
        userType,
        mobile,
        password: hash,
      });
    })
    .then((user) => {
      return res.send({
        data: {
          email: user.email,
          name: user.name,
          userType: user.userType,
          mobile: user.mobile,
        },
      });
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        const message = Object.values(err.errors)
          .map((error) => error.message)
          .join(", ");

        return next(new BadRequestError(message));
      }
      if (err.cause?.code === 11000) {
        return next(new ConflictError(err.message));
      }
      return next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id.toString() },
        NODE_ENV === "production" ? JWT_SECRET : "dev-secret",
        { expiresIn: "15d" },
      );
      return res.status(200).send({ token });
    })
    .catch(() => {
      return next(new UnauthorizedError("Verifique el email o contraseña"));
    });
};
