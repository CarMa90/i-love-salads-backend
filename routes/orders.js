const router = require("express").Router();
const { getOrders, createOrder } = require("../controllers/orders");
const { adminAuth } = require("../middlewares/auth");

router.get("/", adminAuth, getOrders);

router.post("/", createOrder);

module.exports = router;
