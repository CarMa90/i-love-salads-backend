const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { isCelebrateError } = require("celebrate");
const mongoose = require("mongoose");
const { limiter, loginLimiter } = require("./middlewares/limiter");
const { createUser, login } = require("./controllers/users");
const usersRoutes = require("./routes/users");
const ordersRoutes = require("./routes/orders");
const {
  userRegisterValidator,
  userLoginValidator,
} = require("./middlewares/userValidations");
const { auth } = require("./middlewares/auth");
const { requestLogger, errorLogger } = require("./middlewares/logger");
require("dotenv").config();

const app = express();

app.set("trust proxy", 1);

app.use(requestLogger);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use(helmet());
app.use(limiter);

const { NODE_ENV, DB_URL } = process.env;

const dbUrl =
  NODE_ENV === "production" ? DB_URL : "mongodb://localhost:27017/ilovesalads";

mongoose
  .connect(dbUrl)
  .catch((err) => console.error("Error de conexión a MongoDB:", err));

const { PORT = 3000 } = process.env;

app.post("/signup", userRegisterValidator, createUser);
app.post("/signin", loginLimiter, userLoginValidator, login);

app.use(auth);

app.use("/users", usersRoutes);
app.use("/orders", ordersRoutes);

app.use((req, res) => {
  res.status(404).send({
    message:
      "Recurso solicitado no encontrado desde el backend de I Love Salads",
  });
});

app.use(errorLogger);

app.use((err, req, res, next) => {
  if (isCelebrateError(err)) {
    const params = err.details.get("params");

    if (params) {
      return res.status(400).send({
        message: params.details[0].message,
      });
    }

    const body = err.details.get("body");

    if (body) {
      return res.status(400).send({
        message: body.details[0].message,
      });
    }
  }

  const { statusCode = 500, message } = err;

  return res.status(statusCode).send({
    message:
      statusCode === 500 ? "An error has ocurred on the server" : message,
  });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
