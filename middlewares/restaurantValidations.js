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

module.exports = { createRestaurantValidator };
