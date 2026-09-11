const express = require("express");

const router = express.Router();
const usersRouter = require("./users");
const ordersRouter = require("./orders");
const { loginLimiter } = require("../middlewares/limiter");
const {
  userRegisterValidator,
  userLoginValidator,
} = require("../middlewares/userValidations");
const { createUser, login } = require("../controllers/users");
const { auth } = require("../middlewares/auth");

router.post("/signup", userRegisterValidator, createUser);
router.post("/signin", loginLimiter, userLoginValidator, login);

router.use(auth);

router.use("/users", usersRouter);
router.use("/orders", ordersRouter);

module.exports = router;
