const Order = require("../models/order");
const BadRequestError = require("../errors/bad-request-err");
const UnauthorizedError = require("../errors/unauthorized-err");
const NotFoundError = require("../errors/not-found-err");

module.exports.getOrders = (req, res, next) => {
  Order.find({})
    .then((orders) => {
      if (req.user.userType === "client") {
        console.log(req.user._id);
        const clientOrders = orders.filter(
          (order) => order.client.toString() === req.user._id,
        );
        return res.send({
          data: clientOrders,
        });
      }
      if (req.user.userType === "admin" || req.user.userType === "restaurant") {
        return res.send({ data: orders });
      }
    })
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

module.exports.changeOrderStatus = (req, res, next) => {
  const { status } = req.body;

  if (status === "Cancelado") {
    return next(
      new BadRequestError(
        "No se puede cambiar el estado de la orden a 'Cancelado' mediante esta ruta",
      ),
    );
  }

  Order.findOneAndUpdate(
    { _id: req.params.orderId, status: { $ne: "Cancelado" } },
    { status },
    { returnDocument: "after", runValidators: true },
  )
    .orFail(() => {
      const error = new NotFoundError(
        `La orden con id: ${req.params.orderId} no existe`,
      );
      throw error;
    })
    .then((order) => {
      return res.status(200).send({ data: order });
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return next(
          new BadRequestError(`El id: ${req.params.orderId} no es válido`),
        );
      }

      if (err.name === "ValidationError") {
        const validationMessage = err.errors.status
          ? err.errors.status.message
          : "Error de validación";

        return next(new BadRequestError(validationMessage));
      }

      return next(err);
    });
};

module.exports.cancelOrder = (req, res, next) => {};
