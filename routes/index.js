const express = require("express");

const router = express.Router();
const usersRouter = require("./users");
const ordersRouter = require("./orders");
const {
  loginLimiter,
  passwordResetLimiter,
} = require("../middlewares/limiter");
const {
  userRegisterValidator,
  userLoginValidator,
  tokenVerifyValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require("../middlewares/userValidations");
const {
  createUser,
  login,
  verifyAcount,
  forgotPassword,
  resetPassword,
} = require("../controllers/users");
const { auth } = require("../middlewares/auth");

router.post("/signup", userRegisterValidator, loginLimiter, createUser);
router.post("/signin", loginLimiter, userLoginValidator, login);
router.post("/verify-tokens", tokenVerifyValidator, verifyAcount);

router.post(
  "/auth/forgot-password",
  passwordResetLimiter,
  forgotPasswordValidator,
  forgotPassword,
);
router.post(
  "/auth/reset-password",
  passwordResetLimiter,
  resetPasswordValidator,
  resetPassword,
);

router.use(auth);

router.use("/users", usersRouter);
router.use("/orders", ordersRouter);

module.exports = router;
