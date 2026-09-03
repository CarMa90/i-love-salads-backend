const express = require("express");
const { isCelebrateError } = require("celebrate");
const mongoose = require("mongoose");

const app = express();

const { PORT = 3000 } = process.env;

app.use((err, req, res, next) => {
  console.log("ERROR COMPLETO:");
  console.log(err);

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
