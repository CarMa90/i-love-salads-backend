const { isCelebrateError } = require("celebrate");

const errorHandler = (err, req, res, next) => {
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
};

module.exports = errorHandler;
