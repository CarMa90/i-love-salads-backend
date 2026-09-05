const router = require("express").Router();
const {
  getOrders,
  createOrder,
  changeOrderStatus,
} = require("../controllers/orders");
const { adminAuth, adminRestaurantAuth } = require("../middlewares/auth");

router.get("/", getOrders);

router.post("/", createOrder);

router.put("/:orderId/status", adminRestaurantAuth, changeOrderStatus);

module.exports = router;
