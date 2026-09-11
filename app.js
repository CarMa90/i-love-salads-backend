const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const errorHandler = require("./middlewares/errorHandler");
const { limiter } = require("./middlewares/limiter");
const routes = require("./routes/index");
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

app.use("/", routes);

app.use((req, res) => {
  res.status(404).send({
    message:
      "Recurso solicitado no encontrado desde el backend de I Love Salads",
  });
});

app.use(errorLogger);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
