const Order = require("../models/order");
const BadRequestError = require("../errors/bad-request-err");
const UnauthorizedError = require("../errors/unauthorized-err");

module.exports.getOrders = (req, res, next) => {
  Order.find({})
    .then((orders) => res.send({ data: orders }))
    .catch((err) => next(err));
};

module.exports.createOrder = (req, res, next) => {
  const { products } = req.body;

  if (!req.user || !req.user._id) {
    return next(new UnauthorizedError("Usuario no autenticado"));
  }

  if (!Array.isArray(products) || products.length === 0) {
    return next(
      new BadRequestError(
        "La lista de productos es requerida y debe ser un arreglo no vacío",
      ),
    );
  }

  const totalAmount = products.reduce((acumulador, valorActual) => {
    return (acumulador += valorActual.price * valorActual.quantity);
  }, 0);

  Order.create({ client: req.user._id, products, totalAmount })
    .then((order) => {
      res.status(201).send({ data: order });
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(new BadRequestError(err.message));
      }
      return next(err);
    });
};
