const { celebrate, Joi, Segments } = require("celebrate");

const orderIdValidator = celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    orderId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.pattern.base": "El orderId debe ser un ID válido de Mongo.",
        "any.required": "El orderId es obligatorio.",
      }),
  }),
});

const orderStatusValidator = celebrate({
  [Segments.BODY]: Joi.object().keys({
    status: Joi.string()
      .valid("Enviado", "Aceptado", "Listo", "Entregado")
      .required()
      .messages({
        "any.only":
          "El estado debe ser uno de los siguientes: Enviado, Aceptado, Listo, Entregado.",
        "string.empty": "El campo status no puede estar vacío.",
        "any.required": "El status de la orden es requerido.",
      }),
  }),
});

const createOrderValidator = celebrate({
  [Segments.BODY]: Joi.object().keys({
    products: Joi.array()
      .items(
        Joi.object().keys({
          _id: Joi.string().required().messages({
            "string.empty": "El ID del producto no puede estar vacío.",
            "any.required": "El ID del producto es requerido.",
          }),
          name: Joi.string().required().messages({
            "string.empty": "El nombre del producto no puede estar vacío.",
            "any.required": "El nombre del producto es requerido.",
          }),
          price: Joi.number().min(0).required().messages({
            "number.min": "El precio no puede ser negativo.",
            "number.base": "El precio debe ser un número.",
            "any.required": "El precio del producto es requerido.",
          }),
          quantity: Joi.number().integer().min(1).required().messages({
            "number.min": "La cantidad debe ser al menos 1.",
            "number.base": "La cantidad debe ser un número entero.",
            "any.required": "La cantidad es requerida.",
          }),
        }),
      )
      .min(1)
      .required()
      .messages({
        "array.min": "La lista de productos no puede estar vacía.",
        "array.base": "La lista de productos debe ser un arreglo de objetos.",
        "any.required": "La lista de productos es requerida.",
      }),
  }),
});

module.exports = {
  orderIdValidator,
  orderStatusValidator,
  createOrderValidator,
};
