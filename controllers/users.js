const bcrypt = require("bcryptjs");
const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const BadRequestError = require("../errors/bad-request-err");
const ConflictError = require("../errors/conflict-err");
const UnauthorizedError = require("../errors/unauthorized-err");
const NotFoundError = require("../errors/not-found-err");
require("dotenv").config();

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch((err) => next(err));
};

module.exports.getUserInfo = (req, res, next) => {
  const { _id } = req.user;

  User.findById(_id)
    .then((user) => res.send({ data: user }))
    .catch(() => {
      return next(
        new NotFoundError("No se encontró ningún usuario con ese ID"),
      );
    });
};

module.exports.createUser = (req, res, next) => {
  const { email, password, name, userType = "client", mobile } = req.body;

  if (userType === "restaurant") {
    return next(
      new BadRequestError(
        "Los usuarios de sucursal deben ser creados por un administrador",
      ),
    );
  }

  if (!password) {
    return next(new BadRequestError("El password es obligatorio"));
  }

  if (password.length < 8) {
    return next(
      new BadRequestError("El password debe tener al menos 8 caracteres"),
    );
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  if (!passwordRegex.test(password)) {
    return next(
      new BadRequestError(
        "El password debe contener al menos una mayúscula, una minúscula, un número y un caracter especial",
      ),
    );
  }

  if (!mobile || !mobile.phone || !mobile.countryCode) {
    return next(
      new BadRequestError(
        "El número de celular y el código de país son obligatorios",
      ),
    );
  }

  const phoneOtp = crypto.randomInt(100000, 999999).toString();
  const tokenExpires = new Date(Date.now() + 10 * 60 * 1000);

  let emailOtp = null;

  if (userType === "admin") {
    if (!email) {
      return next(
        new BadRequestError(
          "El email es obligatorio para registrar un restaurante",
        ),
      );
    }
    emailOtp = crypto.randomInt(100000, 999999).toString();
  }

  bcrypt
    .hash(password, 10)
    .then((hash) => {
      const userPayload = {
        name,
        password: hash,
        userType,
        mobile: {
          countryCode: mobile.countryCode,
          phone: mobile.phone,
        },
        phoneVerificationToken: phoneOtp,
        phoneTokenExpires: tokenExpires,
        isPhoneVerified: false,
      };

      if (userType === "admin") {
        userPayload.email = email;
        userPayload.emailVerificationToken = emailOtp;
        userPayload.emailTokenExpires = tokenExpires;
        userPayload.isEmailVerified = false;
      }

      return User.create(userPayload);
    })
    .then((user) => {
      console.log(`[SMS OTP enviado a ${user.mobile.phone}]: ${phoneOtp}`);
      if (user.userType === "admin") {
        console.log(`[Email OTP enviado a ${user.email}]: ${emailOtp}`);
      }

      return res.status(201).send({
        data: {
          email: user.email || null,
          name: user.name,
          userType: user.userType,
          mobile: user.mobile,
        },
        message:
          user.userType === "admin"
            ? "Registro inicial correcto. Revisa tu SMS y tu Correo para validar tu cuenta."
            : "Registro inicial correcto. Revisa tu SMS para validar tu cuenta.",
      });
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        const message = Object.values(err.errors)
          .map((error) => error.message)
          .join(", ");

        return next(new BadRequestError(message));
      }
      if (err.code === 11000 || err.cause?.code === 11000) {
        const conflictString = JSON.stringify(err.keyValue || "");
        let customMessage = "Este registro ya existe en el sistema.";

        if (conflictString.includes("phone")) {
          customMessage =
            "Este número de teléfono ya está registrado con otra cuenta.";
        } else if (conflictString.includes("email")) {
          customMessage =
            "Este correo electrónico ya está siendo usado por otro administrador.";
        }

        return next(new ConflictError(customMessage));
      }
      return next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id.toString(), userType: user.userType },
        NODE_ENV === "production" ? JWT_SECRET : "dev-secret",
        { expiresIn: "15d" },
      );
      return res.status(200).send({ token });
    })
    .catch(() => {
      return next(new UnauthorizedError("Verifique el email o contraseña"));
    });
};
