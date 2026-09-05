const router = require("express").Router();
const { getOrders, createOrder } = require("../controllers/orders");

router.get("/", getOrders);

router.post("/", createOrder);

module.exports = router;
