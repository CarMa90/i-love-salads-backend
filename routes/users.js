const router = require("express").Router();
const {
  getUsers,
  getUserInfo,
  createCashier,
} = require("../controllers/users");
const { adminAuth } = require("../middlewares/auth");
const { createCashierValidator } = require("../middlewares/userValidations");

router.get("/", getUsers);

router.get("/me", getUserInfo);

router.post("/cashier", adminAuth, createCashierValidator, createCashier);

module.exports = router;
