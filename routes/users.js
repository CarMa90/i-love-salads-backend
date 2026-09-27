const router = require("express").Router();
const {
  getUsers,
  getUserInfo,
  createCashier,
  disableUser,
  updateMyProfile,
} = require("../controllers/users");
const { adminAuth } = require("../middlewares/auth");
const {
  createCashierValidator,
  userIdValidator,
} = require("../middlewares/userValidations");

router.post("/cashier", adminAuth, createCashierValidator, createCashier);

router.get("/", getUsers);

router.get("/me", getUserInfo);

router.put("/me", updateMyProfile);

router.delete("/me", disableUser);

router.delete("/cashier/:userId", adminAuth, userIdValidator, disableUser);

module.exports = router;
