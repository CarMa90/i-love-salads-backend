const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    status: 429,
    error:
      "Demasiadas peticiones desde esta IP, por favor intenta de nuevo más tarde.",
  },
});

const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  limit: 5, // Máximo 5 intentos fallidos/solicitudes por IP por hora
  message:
    "Demasiados intentos de inicio de sesión. Cuenta bloqueada temporalmente por 1 hora.",
});

module.exports = { limiter, loginLimiter };
