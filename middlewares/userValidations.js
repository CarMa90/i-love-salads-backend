const { celebrate, Joi, Segments } = require("celebrate");
const validator = require("validator");

const userRegisterValidator = celebrate({
  body: Joi.object()
    .keys({
      name: Joi.string().required().min(2).max(30).messages({
        "any.required": "El nombre es obligatorio (celebrate)",
        "string.empty": "El nombre es obligatorio (celebrate)",
        "string.min":
          "El nombre debe contener al menos dos caracteres (celebrate)",
        "string.max":
          "El nombre debe contener máximo 30 caracteres (celebrate)",
      }),
      email: Joi.string()
        .required()
        .custom((value, helpers) => {
          if (!validator.isEmail(value)) {
            return helpers.error("any.email");
          }
          return value;
        })
        .email()
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
            .required()
            .pattern(/^\+\d{1,3}$/)
            .messages({
              "any.required": "El código de país es requerido",
              "string.empty": "El código de país es requerido",
              "string.pattern.base": "El código de país es incorrecto",
            }),

          phone: Joi.string()
            .required()
            .pattern(/^\d{6,14}$/)
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

const userIdValidator = celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    userId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.pattern.base": "El userId debe ser un ID válido de Mongo.",
        "any.required": "El userId es obligatorio.",
      }),
  }),
});

module.exports = { userRegisterValidator, userIdValidator };
