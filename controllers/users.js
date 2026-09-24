const bcrypt = require("bcryptjs");
const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const BadRequestError = require("../errors/bad-request-err");
const ConflictError = require("../errors/conflict-err");
const UnauthorizedError = require("../errors/unauthorized-err");
const NotFoundError = require("../errors/not-found-err");
require("dotenv").config();
const { sendVerificationSms } = require("../services/smsService");
const { sendVerificationEmail } = require("../services/emailService");

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
      // Creamos un arreglo de promesas para disparar los envíos en paralelo
      const trackingPromises = [];

      // 1. Siempre disparamos el SMS (para cliente y admin)
      trackingPromises.push(
        sendVerificationSms(
          user.mobile.countryCode,
          user.mobile.phone,
          phoneOtp,
        ),
      );

      // 2. Si es admin, disparamos también el correo electrónico

      if (user.userType === "admin") {
        trackingPromises.push(sendVerificationEmail(user.email, emailOtp));
      }

      // Esperamos a que los servicios procesen (ya sea simulación o real)
      return Promise.all(trackingPromises).then(() => user);
    })
    .then((user) => {
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

module.exports.verifyAcount = (req, res, next) => {
  const { loginIdentifier, otpCode } = req.body;

  if (!loginIdentifier || !otpCode) {
    return next(
      new BadRequestError("El identificador y el código OTP son obligatorios"),
    );
  }

  const query = {};
  const isNumeric = /^\d+$/.test(loginIdentifier);

  if (isNumeric) {
    query["mobile.phone"] = loginIdentifier;
  } else {
    query.email = loginIdentifier.toLowerCase();
  }

  User.findOne(query)
    .select(
      "+phoneVerificationToken +phoneTokenExpires +emailVerificationToken +emailTokenExpires",
    )
    .then((user) => {
      if (!user) {
        return next(new NotFoundError("Usuario no encontrado"));
      }

      const now = new Date();
      const updateFields = {};

      if (isNumeric) {
        if (user.isPhoneVerified) {
          return next(
            new BadRequestError(
              "Este número de teléfono ya ha sido verificado",
            ),
          );
        }
        if (user.phoneVerificationToken !== otpCode) {
          return next(new BadRequestError("El código SMS es incorrecto"));
        }
        if (now > user.phoneTokenExpires) {
          return next(
            new BadRequestError(
              "El código SMS ha expirado, solicita uno nuevo",
            ),
          );
        }

        updateFields.isPhoneVerified = true;
        updateFields.phoneVerificationToken = null;
      } else {
        if (user.isEmailVerified) {
          return next(
            new BadRequestError(
              "Este correo electrónico ya ha sido verificado",
            ),
          );
        }
        if (user.emailVerificationToken !== otpCode) {
          return next(new BadRequestError("El código de correo es incorrecto"));
        }
        if (now > user.emailTokenExpires) {
          return next(
            new BadRequestError(
              "El código de correo ha expirado, solicita uno nuevo",
            ),
          );
        }

        updateFields.isEmailVerified = true;
        updateFields.emailVerificationToken = null;
      }

      const willPhoneBeVerified = isNumeric ? true : user.isPhoneVerified;
      const willEmailBeVerified = !isNumeric ? true : user.isEmailVerified;

      let shouldSavePermanently = false;

      if (user.userType === "client" && willPhoneBeVerified) {
        shouldSavePermanently = true;
      } else if (
        user.userType === "admin" &&
        willPhoneBeVerified &&
        willEmailBeVerified
      ) {
        shouldSavePermanently = true;
      }

      const mongoUpdate = { $set: updateFields };

      if (shouldSavePermanently) {
        mongoUpdate.$unset = { expireAt: 1 };
      }

      return User.findByIdAndUpdate(user._id, mongoUpdate, {
        returnDocument: "after",
      }).then((updatedUser) => {
        let message = "Verificación parcial correcta.";
        let isFullyActive = false;

        if (updatedUser.userType === "client" && updatedUser.isPhoneVerified) {
          message =
            "¡Cuenta verificada con éxito! Tu registro ahora es permanente.";
          isFullyActive = true;
        } else if (updatedUser.userType === "admin") {
          if (updatedUser.isPhoneVerified && updatedUser.isEmailVerified) {
            message =
              "¡Cuenta verificada con éxito! Tu registro ahora es permanente.";
            isFullyActive = true;
          } else {
            message = isNumeric
              ? "Teléfono verificado. Aún falta verificar tu correo electrónico."
              : "Correo verificado. Aún falta verificar tu número de teléfono.";
          }
        }

        return res.status(200).send({
          data: {
            name: updatedUser.name,
            userType: updatedUser.userType,
            isPhoneVerified: updatedUser.isPhoneVerified,
            isEmailVerified: updatedUser.isEmailVerified,
            isFullyActive,
          },
          message,
        });
      });
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { loginIdentifier, password } = req.body;

  if (!loginIdentifier || !password) {
    return next(
      new BadRequestError("El identificador y el password son obligatorios"),
    );
  }

  return User.findUserByCredentials(loginIdentifier, password)
    .then((user) => {
      if (user.userType === "client" && !user.isPhoneVerified) {
        return next(
          new UnauthorizedError(
            "Por favor, verifica tu número de teléfono celular para poder ingresar",
          ),
        );
      }

      if (user.userType === "admin") {
        if (!user.isPhoneVerified && !user.isEmailVerified) {
          return next(
            new UnauthorizedError(
              "Tu cuenta de administrador requiere verificar tu celular y tu correo electrónico",
            ),
          );
        }
        if (!user.isPhoneVerified) {
          return next(
            new UnauthorizedError(
              "Aún no has verificado tu número de teléfono celular",
            ),
          );
        }
        if (!user.isEmailVerified) {
          return next(
            new UnauthorizedError(
              "Aún no has verificado tu correo electrónico corporativo",
            ),
          );
        }
      }

      const token = jwt.sign(
        {
          _id: user._id.toString(),
          userType: user.userType,
          branchId: user.branchId || null,
        },
        NODE_ENV === "production" ? JWT_SECRET : "dev-secret",
        { expiresIn: "7d" },
      );
      return res.status(200).send({
        data: {
          name: user.name,
          userType: user.userType,
          email: user.email || null,
          mobile: user.mobile || null,
          username: user.username || null,
        },
        token,
        message: "Inicio de sesión exitoso. ¡Bienvenido!",
      });
    })
    .catch(() => {
      return next(new UnauthorizedError("Verifique el email o contraseña"));
    });
};
