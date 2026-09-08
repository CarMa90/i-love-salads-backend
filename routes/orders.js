const router = require("express").Router();
const {
  getOrders,
  createOrder,
  changeOrderStatus,
  cancelOrder,
  cancelAcceptance,
} = require("../controllers/orders");
const { adminAuth, adminRestaurantAuth } = require("../middlewares/auth");
const {
  orderIdValidator,
  orderStatusValidator,
  createOrderValidator,
} = require("../middlewares/ordersValidations");

router.get("/", getOrders);

router.post("/", createOrderValidator, createOrder);

router.put(
  "/:orderId/status",
  adminRestaurantAuth,
  orderIdValidator,
  orderStatusValidator,
  changeOrderStatus,
);

router.put("/:orderId/cancel", adminAuth, orderIdValidator, cancelOrder);

router.put("/:orderId/cancel/acceptance", orderIdValidator, cancelAcceptance);

module.exports = router;
