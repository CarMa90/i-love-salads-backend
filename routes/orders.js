const router = require("express").Router();
const { getOrders } = require("../controllers/orders");

router.get("/", getOrders);

module.exports = router;
