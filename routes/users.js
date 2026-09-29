const router = require("express").Router();
const {
  getUsers,
  getUserInfo,
  createCashier,
  disableUser,
  updateMyProfile,
  resetCashierPassword,
} = require("../controllers/users");
const { adminAuth } = require("../middlewares/auth");
const {
  createCashierValidator,
  userIdValidator,
} = require("../middlewares/userValidations");

router.post("/cashier", adminAuth, createCashierValidator, createCashier);

router.get("/", getUsers);

router.get("/me", getUserInfo);

router.patch("/me", updateMyProfile);

router.patch(
  "/cashier/:userId/reset-password",
  adminAuth,
  userIdValidator,
  resetCashierPassword,
);

router.delete("/me", disableUser);

router.delete("/cashier/:userId", adminAuth, userIdValidator, disableUser);

module.exports = router;
