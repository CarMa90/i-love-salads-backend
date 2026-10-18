const { celebrate, Joi } = require("celebrate");

const createRestaurantValidator = celebrate({
  body: Joi.object()
    .required()
    .keys({
      name: Joi.string().required().min(2).max(50).messages({
        "any.required": "El nombre del restaurante es obligatorio",
        "string.empty": "El nombre del restaurante no puede estar vacío",
        "string.min":
          "El nombre del restaurante debe contener al menos 2 caracteres",
        "string.max":
          "El nombre del restaurante no puede exceder los 50 caracteres",
      }),
      logoUrl: Joi.string().uri().allow(null, "").messages({
        "string.uri":
          "El logotipo debe ser una URL válida de imagen (ej. https://...)",
      }),
      description: Joi.string().max(250).allow(null, "").messages({
        "string.max":
          "La descripción del concepto no puede exceder los 250 caracteres",
      }),
      foodTypes: Joi.array()
        .items(Joi.string().min(2).max(30).trim())
        .required()
        .min(1)
        .messages({
          "any.required":
            "Debes seleccionar al menos una categoría de comida para tu restaurante",
          "array.base":
            "Las categorías de comida deben enviarse en formato de lista (arreglo)",
          "array.min":
            "Debes seleccionar al menos una categoría de comida (ej. Ensaladas, Sopas)",
          "string.min": "Cada categoría debe contener al menos 2 caracteres",
        }),
    })
    .messages({
      "object.base":
        "El cuerpo de la petición debe ser un objeto JSON válido, no un arreglo u otro tipo de dato",
      "any.required": "La petición debe de contener la información requerida",
      "object.empty": "La petición debe de contener la información requerida",
    }),
});

const updateRestaurantValidator = celebrate({
  body: Joi.object()
    .keys({
      name: Joi.string().min(2).max(50).messages({
        "string.min": "El nombre debe contener al menos 2 caracteres",
        "string.max": "El nombre no puede exceder los 50 caracteres",
        "string.empty": "El nombre debe contener al menos 2 caracteres",
      }),
      logoUrl: Joi.string().uri().allow(null, "").messages({
        "string.uri":
          "La imagen debe ser una dirección de URL válida (ej. https://...)",
      }),
      description: Joi.string().max(250).allow(null, ""),
      foodTypes: Joi.array().items(Joi.string().min(2).max(30).trim()).min(1),

      // Validamos la estructura de Loyalty si deciden mandarla
      loyaltyConfig: Joi.object().keys({
        programType: Joi.string()
          .valid("disabled", "wallet", "points")
          .messages({
            "any.only": "El tipo de programa de lealtad elegido no es válido",
          }),
        walletSettings: Joi.object().keys({
          cashbackPercentage: Joi.number().min(0).max(100).messages({
            "number.min": "El porcentaje de cashback no puede ser negativo",
            "number.max": "El porcentaje de cashback no puede exceder el 100%",
          }),
        }),
        pointsSettings: Joi.object().keys({
          pesosPerPoint: Joi.number()
            .min(1)
            .message("El valor en pesos por punto debe ser al menos $1 peso"),
          pointsThreshold: Joi.number()
            .min(1)
            .message("La meta de puntos debe ser al menos de 1 punto"),
          rewardCouponAmount: Joi.number()
            .min(0)
            .message("El valor del cupón de recompensa no puede ser negativo"),
        }),
      }),

      // Validamos la estructura de Promociones si deciden mandarla
      promotions: Joi.object().keys({
        firstPurchaseDiscount: Joi.number().min(0).max(100).messages({
          "number.min": "El descuento de cortesía no puede ser negativo",
          "number.max": "El descuento no puede exceder el 100%",
        }),
        isFirstPurchaseDiscountActive: Joi.boolean(),
      }),
    })
    .required() // 🌟 EL TRUCO: Obliga a que el JSON contenga al menos 1 de las propiedades anteriores para poder avanzar
    .messages({
      "object.min":
        "La petición debe contener al menos un campo con información para actualizar",
      "any.required":
        "La petición debe contener al menos un campo con información para actualizar",
      "object.base": "El cuerpo de la petición debe ser un objeto JSON válido",
      "any.empty":
        "La petición debe contener al menos un campo con información para actualizar",
    }),
});

module.exports = { createRestaurantValidator, updateRestaurantValidator };
