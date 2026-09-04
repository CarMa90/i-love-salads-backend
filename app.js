const express = require("express");
const { isCelebrateError } = require("celebrate");
const mongoose = require("mongoose");
const { createUser, login } = require("./controllers/users");
const usersRoutes = require("./routes/users");
const ordersRoutes = require("./routes/orders");
const {
  userRegisterValidator,
  userLoginValidator,
} = require("./middlewares/userValidations");

const app = express();

mongoose
  .connect("mongodb://localhost:27017/ilovesalads")
  .catch((err) => console.error("Error de conexión a MongoDB:", err));

const { PORT = 3000 } = process.env;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/signup", userRegisterValidator, createUser);
app.post("/signin", userLoginValidator, login);

app.use("/users", usersRoutes);
app.use("/orders", ordersRoutes);

app.use((req, res) => {
  res.status(404).send({
    message:
      "Recurso solicitado no encontrado desde el backend de I Love Salads",
  });
});

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
