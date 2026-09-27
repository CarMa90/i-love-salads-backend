const { celebrate, Joi, Segments } = require("celebrate");
const validator = require("validator");

const userRegisterValidator = celebrate({
  body: Joi.object()
    .keys({
      name: Joi.string().required().min(2).max(30).messages({
        "any.required": "El nombre es obligatorio",
        "string.empty": "El nombre es obligatorio",
        "string.min": "El nombre debe contener al menos dos caracteres",
        "string.max": "El nombre debe contener máximo 30 caracteres",
      }),
      email: Joi.string()
        .custom((value, helpers) => {
          if (!validator.isEmail(value)) {
            return helpers.error("any.email");
          }
          return value;
        })
        .email()
        .when("userType", {
          is: "admin",
          then: Joi.required(),
          otherwise: Joi.optional().allow(null, ""),
        })
        .messages({
          "string.empty": "El email es obligatorio",
          "any.required": "El email es obligatorio",
          "any.email": "El formato de email no es válido",
          "string.email": "El formato de email es incorrecto",
        }),
      password: Joi.string()
        .required()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)
        .messages({
          "string.empty": "El password es obligatorio",
          "string.min": "El password debe tener al menos 8 caracteres",
          "string.pattern.base":
            "El password debe contener al menos una mayúscula, una minúscula, un número y un caracter especial",
          "any.required": "El password es obligatorio",
        }),
      mobile: Joi.object()
        .keys({
          countryCode: Joi.string()
            .pattern(/^\+\d{1,3}$/)
            .when("...userType", {
              is: "restaurant",
              then: Joi.optional().allow(null, ""),
              otherwise: Joi.required(),
            })
            .messages({
              "any.required": "El código de país es requerido",
              "string.empty": "El código de país es requerido",
              "string.pattern.base": "El código de país es incorrecto",
            }),
          phone: Joi.string()
            .pattern(/^\d{6,14}$/)
            .when("...userType", {
              is: "restaurant",
              then: Joi.optional().allow(null, ""),
              otherwise: Joi.required(),
            })
            .messages({
              "any.required": "El teléfono es requerido",
              "string.empty": "El teléfono es requerido",
              "string.pattern.base":
                "El teléfono solo debe contener números y tener entre 6 y 14 dígitos",
            }),
        })
        .required()
        .messages({
          "any.required": "El teléfono móvil es requerido",
          "object.base": "El teléfono móvil debe ser un objeto válido",
        }),
    })
    .unknown(true),
});

const createCashierValidator = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30).messages({
      "any.required": "El nombre del cajero es obligatorio",
      "string.empty": "El nombre del cajero es obligatorio",
      "string.min": "El nombre debe contener al menos dos caracteres",
      "string.max": "El nombre debe contener máximo 30 caracteres",
    }),
    username: Joi.string().required().min(3).max(20).alphanum().messages({
      "any.required": "El nombre de usuario es obligatorio",
      "string.empty": "El nombre de usuario es obligatorio",
      "string.min": "El nombre de usuario debe contener al menos 3 caracteres",
      "string.max": "El nombre de usuario debe contener máximo 20 caracteres",
      "string.alphanum":
        "El nombre de usuario solo puede contener letras y números (sin espacios ni caracteres especiales)",
    }),
    password: Joi.string()
      .required()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)
      .messages({
        "string.empty": "El password es obligatorio",
        "string.min": "El password debe tener al menos 8 caracteres",
        "string.pattern.base":
          "El password debe contener al menos una mayúscula, una minúscula, un número y un caracter especial",
        "any.required": "El password es obligatorio",
      }),
    branchId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.pattern.base": "La sucursal debe ser un ID válido de Mongo.",
        "any.required": "La sucursal es obligatoria.",
        "string.empty": "La sucursal es obligatoria.",
      }),
  }),
});

const userLoginValidator = celebrate({
  body: Joi.object().keys({
    loginIdentifier: Joi.string().required().trim().messages({
      "string.empty": "El campo celular, usuario o correo es obligatorio",
      "any.required": "El identificador de acceso es obligatorio",
    }),
    password: Joi.string()
      .required()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)
      .messages({
        "string.empty": "El password es obligatorio",
        "string.min": "El password debe tener al menos 8 caracteres",
        "string.pattern.base":
          "El password debe contener al menos una mayúscula, una minúscula, un número y un caracter especial",
        "any.required": "El password es obligatorio",
      }),
  }),
});

const userIdValidator = celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    userId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.pattern.base":
          "El identificador de usuario en la URL debe ser un ID válido de Mongo.",
        "any.required":
          "El identificador de usuario es obligatorio en la ruta.",
        "string.empty": "El identificador de usuario no puede estar vacío.",
      }),
  }),
});

const tokenVerifyValidator = celebrate({
  body: Joi.object().keys({
    loginIdentifier: Joi.string().required().trim().messages({
      "string.empty": "El campo celular, usuario o correo es obligatorio",
      "any.required": "El identificador de acceso es obligatorio",
    }),
    otpCode: Joi.string()
      .pattern(/^[0-9]{6}$/)
      .required()
      .messages({
        "string.pattern.base":
          "El código de verificación debe constar de 6 números.",
        "any.required": "El código de verificación es obligatorio.",
        "string.empty": "El código de verificación es obligatorio.",
      }),
  }),
});

module.exports = {
  userRegisterValidator,
  userLoginValidator,
  userIdValidator,
  tokenVerifyValidator,
  createCashierValidator,
};
