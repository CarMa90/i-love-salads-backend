const router = require("express").Router();
const {
  getOrders,
  createOrder,
  changeOrderStatus,
  cancelOrder,
  cancelAcceptance,
} = require("../controllers/orders");
const { adminAuth, adminRestaurantAuth } = require("../middlewares/auth");

router.get("/", getOrders);

router.post("/", createOrder);

router.put("/:orderId/status", adminRestaurantAuth, changeOrderStatus);

router.put("/:orderId/cancel", adminAuth, cancelOrder);

router.put("/:orderId/cancel/acceptance", cancelAcceptance);

module.exports = router;
