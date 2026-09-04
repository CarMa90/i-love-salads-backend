const Order = require("../models/order");

module.exports.getOrders = (req, res, next) => {
  Order.find({})
    .then((orders) => res.send({ data: orders }))
    .catch((err) => next(err));
};
