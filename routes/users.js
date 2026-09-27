const router = require("express").Router();
const {
  getUsers,
  getUserInfo,
  createCashier,
  disableUser,
} = require("../controllers/users");
const { adminAuth } = require("../middlewares/auth");
const {
  createCashierValidator,
  userIdValidator,
} = require("../middlewares/userValidations");

router.get("/", getUsers);

router.get("/me", getUserInfo);

router.post("/cashier", adminAuth, createCashierValidator, createCashier);

router.delete("/me", disableUser);

router.delete("/cashier/:userId", adminAuth, userIdValidator, disableUser);

module.exports = router;
